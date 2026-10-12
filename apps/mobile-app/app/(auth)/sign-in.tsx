import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSignIn } from '@/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuthSuccessHandler } from '@/features/auth';
import { FormErrorAlert } from '@/components/avuny';

interface SignInFormValues {
  identifier: string;
  password: string;
}

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const onSuccess = useAuthSuccessHandler();
  const {
    mutateAsync: signInMutation,
    isPending,
    error,
  } = useSignIn({
    mutation: {
      onSuccess: (data) => onSuccess(data),
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await signInMutation({
        data: {
          identifier: data.identifier.trim(),
          password: data.password,
        },
      });
    } catch (error) {
      // Your API hook can handle errors or you can display a server error here.
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center px-6">
          <Text className="mb-8 text-4xl font-bold">{t('headers.signIn')}</Text>

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
            errorTitle={tCommon('status.error')}
            errorMap={(code) => t(`errors.${code}` as any)}
          />
          <Button
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isPending}>
            {isPending ? <ActivityIndicator color="white" /> : <Text>{t('headers.signIn')}</Text>}
          </Button>

          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-muted-foreground">{t('msgs.orHaveNotAnAccountSignUp')}</Text>

            <Button variant="link" className="ml-1" onPress={() => router.push('/(auth)/sign-up')}>
              <Text>{t('headers.signUp')}</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
