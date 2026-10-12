import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSidebarQueryKey } from '@/api';
// Best Practice: Define your storage key as a constant to avoid typos
const STORAGE_KEY = 'selectedOrganizationId';

export interface SelectedOrganizationContext {
  selectedOrganizationId: string | undefined;
  // State updates are now async because mobile storage operations return Promises
  setSelectedOrganizationId: (id: string) => Promise<void>;
  clearSelectedOrganizationId: () => Promise<void>;
  // Added an isLoading state because AsyncStorage takes a few milliseconds to resolve on mount
  isLoading: boolean;
}

export const SelectedOrganizationContext = createContext<SelectedOrganizationContext>({
  selectedOrganizationId: undefined,
  setSelectedOrganizationId: async () => {},
  clearSelectedOrganizationId: async () => {},
  isLoading: true,
});

export default function SelectedOrganizationContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedOrganizationId, setSelectedOrganizationState] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load the persisted ID from storage when the app mounts
  useEffect(() => {
    const loadOrganizationId = async () => {
      try {
        const storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedId) {
          setSelectedOrganizationState(storedId);
        }
      } catch (error) {
        console.error('Failed to load organization ID from storage:', error);
      } finally {
        setIsLoading(false); // Ensure app knows storage check is complete, even if it fails
      }
    };

    loadOrganizationId();
  }, []);

  const handleSetSelectedOrganizationId = async (id: string) => {
    try {
      // Optimistic UI update: Set React state immediately so the UI feels snappy
      setSelectedOrganizationState(id);
      // queryClient.invalidateQueries({
      //   queryKey: [getGetSidebarQueryKey()],
      // });
      queryClient.removeQueries({
        queryKey: [getGetSidebarQueryKey()],
      });

      if (__DEV__) {
        console.log('Setting Organization ID:', id);
      }

      // Persist to disk asynchronously
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      console.error('Failed to save organization ID to storage:', error);
      // Optional: Revert the React state here if the storage operation fails
    }
  };

  const handleClearSelectedOrganizationId = async () => {
    try {
      setSelectedOrganizationState(undefined);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove organization ID from storage:', error);
    }
  };

  return (
    <SelectedOrganizationContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId: handleSetSelectedOrganizationId,
        clearSelectedOrganizationId: handleClearSelectedOrganizationId,
        isLoading,
      }}>
      {/* 
        Optional Best Practice: 
        You can return a null or a Splash Screen here if `isLoading` is true, 
        so your app doesn't flash the wrong organization data before storage loads.
      */}
      {children}
    </SelectedOrganizationContext.Provider>
  );
}

export function useSelectedOrganizationContext() {
  const context = useContext(SelectedOrganizationContext);

  if (context === undefined) {
    throw new Error(
      'useSelectedOrganizationContext must be used within a SelectedOrganizationContextProvider'
    );
  }

  return context;
}
