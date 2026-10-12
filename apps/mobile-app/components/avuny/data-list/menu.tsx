import * as React from 'react';
import { Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { MoreVertical } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';

export type MenuAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  isDestructive?: boolean;
  isSeparator?: boolean;
  onPress: () => void;
};

interface DataListMenuProps {
  actions: MenuAction[];
}

export function DataListMenu({ actions }: DataListMenuProps) {
  if (!actions?.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          className="bg-secondary/40 active:bg-secondary/80 h-8 w-8 items-center justify-center rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon as={MoreVertical} className="text-foreground size-4.5" />
        </Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent insets={{ left: 16, right: 16 }} className="w-56">
        {actions.map((action, index) => {
          if (action.isSeparator) {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }

          const textColor = action.isDestructive ? 'text-destructive' : 'text-foreground';

          return (
            <DropdownMenuItem
              key={action.id}
              onPress={action.onPress}
              className="flex-row items-center gap-3">
              <Icon as={action.icon} className={`size-4.5 ${textColor}`} />
              <Text
                className={`${textColor} text-base ${action.isDestructive ? 'font-medium' : ''}`}>
                {action.label}
              </Text>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
