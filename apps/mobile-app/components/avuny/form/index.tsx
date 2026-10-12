import React, { ForwardedRef, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { SubmitButton } from '@/components/avuny/submit-button';
import { FormErrorAlert, FormErrorAlertProps } from '@/components/avuny/form/form-error';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface FormWrapperProps<
  T extends FieldValues,
  C extends string = string,
> extends FormErrorAlertProps<C> {
  children: ReactNode;
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onSuccess?: () => void | Promise<void>; // Added missing onSuccess typing
  isPending?: boolean;
  title?: string;
  loadingTitle?: string;
  disabled?: boolean;
  /** Allows you to override the inner padding or layout if a specific screen needs it */
  contentClassName?: string;

  actionName: 'create' | 'add' | 'update';
  resourceName:
    'organization' | 'role' | 'item' | 'warehouse' | 'organizationUser' | 'unit' | 'unitCollection';
  queryInvalidateKey?: readonly [string, ...any[]] | [string, ...any[]];
  cardTitle?: string;
  cardDescription?: string;
  dismissSheet?: {
    ref: React.RefObject<BottomSheetModal>;
  };
}

export function Form<T extends FieldValues, C extends string = string>({
  children,
  methods,
  onSubmit,
  onSuccess,
  isPending = false,
  disabled,
  contentClassName = 'flex-1 justify-center gap-3 p-5',
  actionName,
  resourceName,
  queryInvalidateKey,
  cardTitle,
  cardDescription,
  dismissSheet,
  ...errorProps
}: FormWrapperProps<T, C>) {
  const { t: tCommon } = useTranslation('common');
  const queryClient = useQueryClient();

  const thing = resourceName ? tCommon(`entities.${resourceName}`) : '';
  const action = actionName ? tCommon(`actions.${actionName}`) : '';

  const cardTitleFinal =
    cardTitle ||
    (action && thing ? tCommon('msgs.actionThingTitle', { action, thing }) : undefined);

  const cardDescriptionFinal =
    cardDescription ||
    (action && thing ? tCommon('msgs.actionThingDescription', { action, thing }) : undefined);

  const successToast = tCommon(actionName ? `msgs.${actionName}` : 'msgs.save', {
    thing,
  });
  const submitButtonTitle = tCommon(`actions.${actionName}`);
  const loadingTitle = tCommon('status.loading');

  const finalSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      toast.success(successToast);

      if (queryInvalidateKey) {
        queryClient.invalidateQueries({
          queryKey: queryInvalidateKey,
        });
      }

      await onSuccess?.();
      dismissSheet?.ref.current.dismiss();
    } catch (error) {
      // Allow react-hook-form or the parent component to handle the UI error state
      console.error('Form submission failed:', error);
    }
  };

  // If `disabled` isn't explicitly passed, it falls back to hook-form's native valid state
  const isButtonDisabled = disabled !== undefined ? disabled : !methods.formState.isValid;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FormProvider {...methods}>
          <View className={contentClassName}>
            {/* Render dynamically translated titles if they exist */}
            {(cardTitleFinal || cardDescriptionFinal) && (
              <View className="mb-4">
                {cardTitleFinal && (
                  <Text className="text-foreground text-2xl font-bold">{cardTitleFinal}</Text>
                )}
                {cardDescriptionFinal && (
                  <Text className="text-muted-foreground mt-1 text-sm">{cardDescriptionFinal}</Text>
                )}
              </View>
            )}

            {children}

            <FormErrorAlert {...errorProps} />

            <SubmitButton
              onPress={methods.handleSubmit(finalSubmit)}
              disabled={isButtonDisabled}
              isPending={isPending}
              title={submitButtonTitle}
              loadingTitle={loadingTitle}
            />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
