import { CircleAlert } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type FormErrorAlertProps<C extends string> = {
  error?: { code?: C; message?: string };
  errorMap?: (code: C) => string;
  errorTitle?: string;
};

export function FormErrorAlert<C extends string>({
  error,
  errorMap,
  errorTitle = 'Something went wrong',
}: FormErrorAlertProps<C>) {
  const { t: tCommon } = useTranslation('common');
  const code = error?.code;

  const message = code ? errorMap?.(code) : error?.message;
  if (!message) {
    return <View></View>;
  }

  return (
    <Alert icon={CircleAlert} variant="destructive">
      <AlertTitle>{tCommon('status.error')}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
