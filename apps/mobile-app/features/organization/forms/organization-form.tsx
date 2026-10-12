import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { mutateOrganizationSchema } from '@/lib/schemas';
import { z } from '@avuny/zod';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

// import { FormDatePicker } from '@/components/avuny/FormDatePicker';
import { FormInput } from '@/components/avuny/FormInput';
import { FormSelect } from '@/components/avuny/FormSelect';
import { FormTextarea } from '@/components/avuny/FormTextArea';
import { SubmitButton } from '@/components/avuny/submit-button';

const schema = mutateOrganizationSchema.extend({
  countryId: z.uuid(),
});

type FormValues = z.infer<typeof schema>;

interface OrganizationFormProps {
  organization?: FormValues;

  states: { id: string; name: string }[];
  countries: { id: string; name: string }[];

  setCountryId: (id: string) => void;

  onSubmit: (values: FormValues) => void;

  isPending?: boolean;
}

export function OrganizationForm({
  organization,
  countries,
  states,
  setCountryId,
  onSubmit,
  isPending = false,
}: OrganizationFormProps) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      inventoryStartDate: new Date().toISOString(),
      address: null,
      description: null,
      zipCode: null,
      industryCategoryId: null,
      fiscalYearPatternId: null,
    },
  });

  const {
    reset,
    formState: { isValid },
  } = methods;

  useEffect(() => {
    if (organization) {
      reset(organization);
    }
  }, [organization, reset]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FormProvider {...methods}>
          <View className="flex-1 justify-center gap-3 p-5">
            <FormInput
              control={methods.control}
              name="name"
              label="Organization Name"
              placeholder="Organization Name"
            />

            <FormTextarea
              control={methods.control}
              name="description"
              label="Description"
              placeholder="Description"
            />

            <FormSelect
              control={methods.control}
              name="countryId"
              label="Country"
              placeholder="Select country"
              options={countries}
              onSelectedValueChange={setCountryId}
            />

            <FormSelect
              control={methods.control}
              name="stateId"
              label="State"
              placeholder="Select state"
              options={states}
            />

            {/* <FormDatePicker name="inventoryStartDate" label="Inventory Start Date" /> */}

            <SubmitButton
              onPress={methods.handleSubmit(onSubmit)}
              disabled={!isValid}
              isPending={isPending}
              title={organization ? 'Update Organization' : 'Create Organization'}
              loadingTitle={organization ? 'Updating...' : 'Creating...'}
            />
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
