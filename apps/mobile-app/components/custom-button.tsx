import React from 'react';

import { FontAwesome5 } from '@expo/vector-icons';
import { Button, ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface CustomButtonProps extends ButtonProps {
  title: string;

  icon?: keyof typeof FontAwesome5.glyphMap;
  iconColor?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ title, icon, iconColor, ...props }) => {
  return (
    <Button {...props}>
      {icon && <FontAwesome5 name={icon} size={18} color={iconColor} />}
      <Text>{title}</Text>
    </Button>
  );
};
