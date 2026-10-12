import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  setAuth: (
    tokens: { accessToken: string; refreshToken: string },
    user: any
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
  });

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        const userRaw = await SecureStore.getItemAsync('auth_user');

        if (token && userRaw) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            accessToken: token,
            user: JSON.parse(userRaw),
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    loadStoredAuth();
  }, []);

  const setAuth = async (
    tokens: { accessToken: string; refreshToken: string },
    user: any
  ) => {
    await SecureStore.setItemAsync('access_token', tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));

    setState({
      isAuthenticated: true,
      isLoading: false,
      accessToken: tokens.accessToken,
      user,
    });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('auth_user');

    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
