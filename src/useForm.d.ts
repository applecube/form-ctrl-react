import type { FormConstructorOptions, FormId, FormValues } from 'form-ctrl-vanilla';
import type { FormCtrl } from './FormCtrl';

export const useForm: (
  formId: FormId,
  options?: FormConstructorOptions & { keepAfterUnmount?: boolean; addValues?: FormValues },
) => FormCtrl;
