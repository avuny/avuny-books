import React from 'react';
import { View, StyleSheet, I18nManager, Image, ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/context/PreferencesContext';
import { CustomButton } from '@/components/custom-button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ChartNoAxesCombined } from 'lucide-react-native';
import { ThemeToggle } from '@/components/toggle-theme';
import { useUniwind } from 'uniwind';
export default function MainAuthScreen() {
  const { isDark, changeLanguage, toggleTheme } = usePreferences();
  const { t, i18n } = useTranslation('auth');
  const router = useRouter();
  const LOGO = {
    light: require('@/assets/images/react-native-reusables-light.png'),
    dark: require('@/assets/images/react-native-reusables-dark.png'),
  };

  const SCREEN_OPTIONS = {
    title: 'React Native Reusables',
    headerTransparent: true,
    headerRight: () => <ThemeToggle />,
  };

  const IMAGE_STYLE: ImageStyle = {
    height: 76,
    width: 76,
  };
  const { theme } = useUniwind();
  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.logoContainer}>
        <Icon as={ChartNoAxesCombined} size={32} />

        <Text className="ios:text-foreground text-muted-foreground font-mono text-sm">Avuny</Text>
      </View>

      <View style={styles.heroContainer}>
        <Image source={LOGO[theme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
      </View>

      <View style={styles.actionContainer}>
        {/* <Text style={[styles.title, { color: colors.text }]}>
          {t("organize")}
        </Text> */}

        <View style={styles.buttonGroup}>
          <CustomButton
            title={t('headers.signUp')}
            variant={'default'}
            onPress={() => router.push('/(auth)/sign-up')}
          />

          <CustomButton
            title={t('headers.signIn')}
            variant="outline"
            onPress={() => router.push('/(auth)/sign-in')}
          />

          <View style={[styles.divider]} />

          <CustomButton
            title={'GOOGLE'}

            icon="google"
            iconColor={isDark ? '#fff' : '#db4437'}

            onPress={() => router.replace('/workspace')}
          />

          <CustomButton
            title={'FACEBOOK'}
            icon="facebook"
            iconColor="#4267B2"
            onPress={() => router.replace('/workspace')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  utilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 10,
    height: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    marginLeft: 8,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
