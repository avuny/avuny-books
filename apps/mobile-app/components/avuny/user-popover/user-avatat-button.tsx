import { UserRoundIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface UserAvatarButtonProps {
  onPress: () => void;
}

export function UserAvatarButton({ onPress }: UserAvatarButtonProps) {
  return (
    <Button
      onPress={onPress}
      size="icon"
      variant="ghost"
      className="bg-primary/10 active:bg-primary/20 m-2 size-8 rounded-full">
      <Icon as={UserRoundIcon} className="text-primary size-5" />
    </Button>
  );
}
