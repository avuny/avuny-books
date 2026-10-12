import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Uniwind, useUniwind } from 'uniwind';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';

export function ThemeToggle() {
  const { theme } = useUniwind();
  const THEME_ICONS = {
    light: SunIcon,
    dark: MoonStarIcon,
  };

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    Uniwind.setTheme(newTheme);
  }

  return (
    <Button
      onPressIn={toggleTheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 web:mx-4 rounded-full">
      <Icon as={THEME_ICONS[theme ?? 'light']} className="size-5" />
    </Button>
  );
}
