import React, { createContext, useContext, useMemo, useState } from 'react';
import { DevSettings, I18nManager, useColorScheme } from 'react-native';
import * as Updates from 'expo-updates';

import i18n from '../i18n/i18n';

interface ThemeColors {
  background: string;
  text: string;
  surface: string;
  border: string;
  primary: string;
  subtle: string;
}

interface PreferencesContextType {
  isDark: boolean;
  isRTL: boolean;
  currentLanguage: string;
  colors: ThemeColors;
  toggleTheme: () => void;
  changeLanguage: (lang: string) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();

  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const isRTL = I18nManager.isRTL;

  const currentLanguage = i18n.language;

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const changeLanguage = async (lang: string) => {
    try {
      const shouldRTL = lang === 'ar';

      await i18n.changeLanguage(lang);

      if (I18nManager.isRTL !== shouldRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(shouldRTL);

        // Development
        if (__DEV__) {
          DevSettings.reload();
          return;
        }

        // Production / release builds
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const colors = useMemo<ThemeColors>(
    () => ({
      background: isDark ? '#000000' : '#ffffff',

      text: isDark ? '#ffffff' : '#000000',

      surface: isDark ? '#121212' : '#f8f9fa',

      border: isDark ? '#262626' : '#e5e5e5',

      primary: isDark ? '#ffffff' : '#000000',

      subtle: isDark ? '#a0a0a0' : '#666666',
    }),
    [isDark]
  );

  const value = useMemo(
    () => ({
      isDark,
      isRTL,
      currentLanguage,
      colors,
      toggleTheme,
      changeLanguage,
    }),
    [isDark, isRTL, currentLanguage, colors]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }

  return context;
};
