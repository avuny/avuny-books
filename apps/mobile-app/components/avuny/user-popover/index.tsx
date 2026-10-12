import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { LucideIcon, LanguagesIcon, MoonIcon } from 'lucide-react-native';

interface UserPopoverProps {
  visible: boolean;
  onClose: () => void;

  name: string;
  email: string;

  language: React.ReactNode;
  appearance: React.ReactNode;

  onSignOut: () => void;
}
function MenuRow({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center gap-3">
        <Icon as={icon} className="text-primary size-5" />

        <Text className="text-base">{title}</Text>
      </View>

      {children}
    </View>
  );
}

export function UserPopover({
  visible,
  onClose,
  onSignOut,
  name,
  email,
  language,
  appearance,
}: UserPopoverProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/20" onPress={onClose}>
        <View className="absolute top-16 right-4 w-72 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <View className="flex-row items-center gap-4 p-5">
            <View className="bg-primary/10 size-14 items-center justify-center rounded-full">
              <Ionicons name="person" size={28} className="text-primary" />
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold">{name}</Text>

              <Text className="text-muted-foreground text-sm">{email}</Text>
            </View>
          </View>

          <View className="bg-border h-px" />

          {/* Menu */}

          <View className="py-2">
            <MenuRow icon={LanguagesIcon} title="Language">
              {language}
            </MenuRow>

            <MenuRow icon={MoonIcon} title="Appearance">
              {appearance}
            </MenuRow>
          </View>

          <View className="bg-border mx-5 h-px" />

          <Pressable
            onPress={onSignOut}
            className="active:bg-destructive/10 mx-3 my-3 flex-row items-center gap-3 rounded-2xl px-4 py-4">
            <Ionicons name="log-out-outline" size={20} className="text-destructive" />

            <Text className="text-destructive font-medium">Sign out</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
