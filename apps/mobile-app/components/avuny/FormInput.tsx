import React from 'react';
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { FormField } from './FormField';

type FormInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName;
  label?: string;
  rules?: RegisterOptions<TFieldValues, TName>;
  control: Control<TFieldValues>;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChangeText'>;

export function FormInput<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  label,
  rules,
  control,
  ...props
}: FormInputProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormField label={label} error={fieldState.error?.message}>
          <Input
            {...props}
            ref={field.ref}
            value={field.value == null ? '' : String(field.value)}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        </FormField>
      )}
    />
  );
}
