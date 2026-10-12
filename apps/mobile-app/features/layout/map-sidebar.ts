import { GetSidebar200Item } from '@/api/model';

import { Href } from 'expo-router';
import { HelpCircle, LucideIcon } from 'lucide-react-native';

export type MenuLinkItem = {
  href: Href;
  title: string;
  description?: string;
  icon: LucideIcon;
  metric?: number;
};

export type MenuOptionConfig = {
  href: Href;
  icon: LucideIcon;
  description?: string;
  metric?: number;
};

export function mapSidebarOptionsToMenuLinks(
  module: GetSidebar200Item | undefined,
  config: Record<string, MenuOptionConfig>
): MenuLinkItem[] {
  if (!module) return [];

  return module.options
    .map((option) => {
      const item = config[option.name];

      if (!item) return null;

      return {
        href: item.href,
        title: option.label, // label from server
        description: item.description,
        metric: item.metric,
        icon: item.icon,
      };
    })
    .filter(Boolean) as MenuLinkItem[];
}
