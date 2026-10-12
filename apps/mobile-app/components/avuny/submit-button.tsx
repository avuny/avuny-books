import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

// Assuming your Button accepts standard React Native Pressable/TouchableOpacity props
interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  title: string;
  loadingTitle?: string;
  isPending?: boolean;
}

export function SubmitButton({
  title,
  loadingTitle = 'Loading...',
  isPending = false,
  disabled,
  className = '',
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      disabled={disabled || isPending}
      className={`flex-row items-center justify-center gap-2 ${className}`}
      {...props}>
      {isPending ? (
        <>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text>{loadingTitle}</Text>
        </>
      ) : (
        <Text>{title}</Text>
      )}
    </Button>
  );
}
