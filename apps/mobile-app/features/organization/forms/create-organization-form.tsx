import React from 'react';
// Note: You can likely remove SafeAreaView if you aren't wrapping the return with it anymore!
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import {
  getOrganizationListQueryKey,
  useCountryList,
  useCreateOrganization,
  useStateList,
} from '@/api';
import { OrganizationForm } from '@/features/organization/forms/organization-form';
import { useSelectedOrganizationContext } from '@/context/selected-org-provider';

// 1. Define the props interface
interface CreateOrganizationFormProps {
  onSuccess?: () => void;
}

// 2. Add the onSuccess prop to the component signature
export function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { setSelectedOrganizationId } = useSelectedOrganizationContext();

  const [countryId, setCountryId] = React.useState('');

  const { data: countries = [] } = useCountryList();

  const { data: states = [] } = useStateList(
    { countryId },
    {
      query: {
        enabled: !!countryId,
        queryKey: ['states', countryId],
      },
    }
  );

  const createOrganization = useCreateOrganization({
    mutation: {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({
          queryKey: getOrganizationListQueryKey(),
        });

        setSelectedOrganizationId(data.id);

        // 3. Trigger the onSuccess callback to close the modal
        onSuccess?.();

        router.replace('/(app)/(tabs)/home');
        // or router.replace(`/(app)/${data.id}`)
      },
    },
  });

  return (
    <OrganizationForm
      countries={countries}
      states={states}
      setCountryId={setCountryId}
      isPending={createOrganization.isPending}
      onSubmit={(values) => createOrganization.mutateAsync({ data: values })}
    />
  );
}
