// import React, { useState } from 'react';
// import { Platform, Pressable } from 'react-native';
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// import {
//   Controller,
//   FieldPath,
//   FieldValues,
//   RegisterOptions,
//   useFormContext,
// } from 'react-hook-form';

// import { FormField } from './FormField';
// import { Text } from '@/components/ui/text';

// type NativeDateTimePickerProps = React.ComponentProps<typeof DateTimePicker>;

// type FormDatePickerProps<
//   TFieldValues extends FieldValues,
//   TName extends FieldPath<TFieldValues>,
// > = {
//   name: TName;
//   label?: string;
//   placeholder?: string;
//   rules?: RegisterOptions<TFieldValues, TName>;

//   mode?: 'date' | 'time' | 'datetime';

//   display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';

//   minimumDate?: Date;
//   maximumDate?: Date;

//   disabled?: boolean;
// };

// export function FormDatePicker<
//   TFieldValues extends FieldValues,
//   TName extends FieldPath<TFieldValues>,
// >({
//   name,
//   label,
//   placeholder = 'Select date',
//   rules,
//   mode,
//   display,
//   minimumDate,
//   maximumDate,
// }: FormDatePickerProps<TFieldValues, TName>) {
//   const { control } = useFormContext<TFieldValues>();
//   const [open, setOpen] = useState(false);

//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field, fieldState }) => {
//         const value = (field.value as Date | null) ?? null;

//         const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
//           // Android closes automatically after selection/cancel.
//           if (Platform.OS !== 'ios') {
//             setOpen(false);
//           }

//           // Ignore cancel events.
//           if (!selectedDate) {
//             return;
//           }

//           field.onChange(selectedDate);
//         };

//         return (
//           <FormField label={label} error={fieldState.error?.message}>
//             <Pressable
//               onPress={() => setOpen(true)}
//               className={`min-h-10 justify-center rounded-md border px-3 py-2 ${
//                 fieldState.error ? 'border-destructive' : 'border-input'
//               }`}>
//               <Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
//                 {value ? value.toLocaleDateString() : placeholder}
//               </Text>
//             </Pressable>

//             {open && (
//               <DateTimePicker
//                 value={value ?? new Date()}
//                 onChange={handleChange}
//                 mode={mode as 'date' | 'time'}
//                 display={display}
//                 minimumDate={minimumDate}
//                 maximumDate={maximumDate}
//               />
//             )}
//           </FormField>
//         );
//       }}
//     />
//   );
// }
