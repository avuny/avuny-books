import React from 'react';
import {
  Controller,
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';

import { FormField } from './FormField';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SelectOption = {
  id: string;
  name: string;
};

type FormSelectProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  rules?: RegisterOptions<TFieldValues, TName>;
  disabled?: boolean;
  onSelectedValueChange?: (id: string) => void;
  control: Control<TFieldValues>;
};

export function FormSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder = 'Select...',
  options,
  rules,
  disabled,
  onSelectedValueChange,
  control,
}: FormSelectProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.id === field.value);

        return (
          <FormField label={label} error={fieldState.error?.message}>
            <Select
              disabled={disabled}
              value={
                selected
                  ? {
                      value: selected.id,
                      label: selected.name,
                    }
                  : undefined
              }
              onValueChange={(option) => {
                if (!option) return;

                field.onChange(option.value);
                onSelectedValueChange?.(option.value);
              }}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id} label={option.name} />
                ))}
              </SelectContent>
            </Select>
          </FormField>
        );
      }}
    />
  );
}
