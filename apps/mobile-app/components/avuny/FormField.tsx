import React from 'react';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

interface FormFieldProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <View className={className ?? 'gap-2'}>
      {label && <Label>{label}</Label>}
      {children}
      {!!error && <Text className="text-destructive text-sm">{error}</Text>}
    </View>
  );
}
