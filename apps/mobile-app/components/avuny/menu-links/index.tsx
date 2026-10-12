import { View, TouchableOpacity } from 'react-native';
import { type Href, Link, useTheme } from 'expo-router';
import { Text } from '@/components/ui/text';
import { LucideIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

// 1. Enhanced Type for an individual card
export type MenuLinkItem = {
  href: Href;
  title: string;
  description?: string;
  icon: LucideIcon;
  metric?: string | number;
};

// 2. Updated Props interface
export interface MenuLinksProps {
  header: string;
  subHeader?: string;
  links: MenuLinkItem[];
  columns?: 1 | 2;
}

// 💡 FIX 1: Set the default to 2 right here in the props
export function MenuLinks({ header, subHeader, links, columns = 2 }: MenuLinksProps) {
  const { colors } = useTheme();

  // Helper boolean to make class switching cleaner
  const isGrid = columns === 2;

  return (
    <View className="bg-background flex-1">
      <Text variant="h3" className="mt-3">
        {header}
      </Text>

      {subHeader && (
        <Text variant="muted" className="mb-6">
          {subHeader}
        </Text>
      )}

      {/* Note: flex-row is required here so they sit beside each other */}
      <View className={isGrid ? 'flex-row flex-wrap justify-between gap-y-4' : 'flex-col gap-4'}>
        {links.map((item, index) => (
          <Link href={item.href} asChild key={index}>
            {/* 💡 FIX 2: Added the dynamic width (`w-[48%]` vs `w-full`) to the TouchableOpacity */}
            <TouchableOpacity
              className={`bg-card border-border rounded-2xl border p-5 shadow-sm ${
                isGrid ? 'w-[48%]' : 'w-full'
              }`}>
              <View className="mb-3 flex-row items-center justify-between">
                <Icon as={item.icon} className="text-primary size-5" />
                <Text variant="small" className="text-muted-foreground">
                  {/* Hide the title in the top corner if it's a grid so it fits better */}
                  {isGrid ? '>' : `${item.title} >`}
                </Text>
              </View>

              {/* Show title lower down if in column/grid mode */}
              {isGrid && <Text className="text-foreground mb-1 font-semibold">{item.title}</Text>}

              {item.metric !== undefined && (
                <Text className="text-foreground text-4xl font-extrabold">{item.metric}</Text>
              )}

              {item.description && (
                <Text variant="muted" className="mt-1">
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}
