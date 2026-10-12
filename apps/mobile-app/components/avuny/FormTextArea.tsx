import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { TextInputProps } from 'react-native';

import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';

type FormTextareaProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName;
  label?: string;
  rules?: RegisterOptions<TFieldValues, TName>;
  control: Control<TFieldValues>;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function FormTextarea<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, label, rules, control, ...props }: FormTextareaProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormField label={label} error={fieldState.error?.message}>
          <Textarea
            {...props}
            ref={field.ref}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            multiline
            textAlignVertical="top"
          />
        </FormField>
      )}
    />
  );
}
