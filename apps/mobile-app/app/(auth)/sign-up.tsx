import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import { useSignUp } from '@/api';
import { useAuthSuccessHandler } from '@/features/auth';
import { FormErrorAlert } from '@/components/avuny';

interface SignUpFormValues {
  identifier: string;
  name: string;
  password: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const onSuccess = useAuthSuccessHandler();
  const [serverError, setServerError] = useState('');

  const {
    mutateAsync: signUpMutation,
    isPending,
    error,
  } = useSignUp({
    mutation: {
      onSuccess: (data) => onSuccess(data),
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SignUpFormValues>({
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      name: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setServerError('');

      await signUpMutation({
        data: {
          identifier: data.identifier.trim(),
          name: data.name.trim(),
          password: data.password,
        },
      });

      reset();
    } catch (error: any) {
      setServerError(error?.response?.data?.message ?? t('errors.AUTH_USER_CREATION_FAILED'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center px-6">
          <Text className="mb-8 text-4xl font-bold">{t('headers.signUp')}</Text>

          {/* Identifier */}
          <View className="mb-5 gap-2">
            <Label>{t('labels.identifier')}</Label>

            <Controller
              control={control}
              name="identifier"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('labels.identifier')}
                />
              )}
            />

            {errors.identifier && (
              <Text className="text-destructive text-sm">{errors.identifier.message}</Text>
            )}
          </View>

          {/* Name */}
          <View className="mb-5 gap-2">
            <Label>{t('labels.name')}</Label>

            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  placeholder={t('labels.name')}
                />
              )}
            />

            {errors.name && <Text className="text-destructive text-sm">{errors.name.message}</Text>}
          </View>

          {/* Password */}
          <View className="gap-2">
            <Label>{t('labels.password')}</Label>

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('labels.password')}
                />
              )}
            />

            {errors.password && (
              <Text className="text-destructive text-sm">{errors.password.message}</Text>
            )}
          </View>

          <FormErrorAlert
            error={{
              code: (error as any)?.response?.data?.code,
              message: error?.message,
            }}
            errorMap={(code) => t(`errors.${code}` as any)}
          />

          <Button
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isPending}>
            {isPending ? <ActivityIndicator color="white" /> : <Text>{t('headers.signUp')}</Text>}
          </Button>

          <View className="mt-6 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground">{t('msgs.orAlreadyHaveAnAccountSignIn')}</Text>

            <Button variant="link" onPress={() => router.push('/(auth)/sign-in')}>
              <Text>{t('headers.signIn')}</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
