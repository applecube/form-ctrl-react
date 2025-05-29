import React from 'react';
import { FormCtrl, type FormId, type FormConstructorOptions, type FormValues } from './FormCtrl.js';
import { useValueChanged } from './utils.js';

export const useForm = (
  formId: FormId,
  {
    validationEventName,
    validation,
    keepAfterUnmount,
    values,
    addValues,
  }: FormConstructorOptions & { keepAfterUnmount?: boolean; addValues?: FormValues } = {},
): FormCtrl => {
  const form =
    FormCtrl.get<FormCtrl>(formId) ||
    new FormCtrl(formId, {
      validationEventName,
      validation,
      values: values || addValues ? { ...values, ...addValues } : undefined,
    });

  if (useValueChanged(values)) form.resetValues(values || {});
  if (useValueChanged(addValues) && addValues) form.setValues(addValues);

  React.useEffect(
    () => () => {
      if (!keepAfterUnmount) form.destroy();
    },
    [form, keepAfterUnmount],
  );

  return form;
};
