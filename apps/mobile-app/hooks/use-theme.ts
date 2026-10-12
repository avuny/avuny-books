import { useColorScheme } from 'react-native';
import { Colors, ThemeColor } from '@/constants/theme';

export function useTheme(): Record<ThemeColor, string> {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
