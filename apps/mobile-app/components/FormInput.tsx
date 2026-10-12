import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  I18nManager,
  TextInputProps,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  isDark: boolean;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  isDark,
  error,
  style,
  ...props
}) => {
  const textColor = isDark ? '#ffffff' : '#000000';

  const borderColor = error
    ? '#ff3b30'
    : isDark
      ? '#333333'
      : '#e5e5e5';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isDark ? '#a0a0a0' : '#666666' },
        ]}
      >
        {label}
      </Text>

      <TextInput
        {...props}
        style={[
          styles.input,
          {
            color: textColor,
            borderColor,
            backgroundColor: isDark ? '#121212' : '#fafafa',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
          },
          style,
        ]}
        placeholderTextColor={isDark ? '#555555' : '#cccccc'}
      />

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'left',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'left',
  },
});
