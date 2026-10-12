import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type LoadingScreenProps = {
  message?: string;
  fullscreen?: boolean;
  size?: 'small' | 'large';
};

export function LoadingScreen({ message, fullscreen = true, size = 'large' }: LoadingScreenProps) {
  return (
    <View
      className={['bg-background items-center justify-center', fullscreen ? 'flex-1' : 'py-8'].join(
        ' '
      )}>
      <ActivityIndicator size={size} />

      {message ? <Text className="text-muted-foreground mt-4 text-sm">{message}</Text> : null}
    </View>
  );
}
