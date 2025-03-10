import React from 'react';
import { FormCtrl } from './FormCtrl';
import { useValueChanged } from './utils';

export const useForm = (
  formId,
  { validationEventName, validation, keepAfterUnmount, values, addValues } = {},
) => {
  const form = FormCtrl.get(formId) || new FormCtrl(formId, { validationEventName, validation, values });

  if (useValueChanged(values)) form.resetValues(values);
  if (useValueChanged(addValues)) form.setValues(addValues);

  React.useEffect(
    () => () => {
      if (!keepAfterUnmount) form.destroy();
    },
    [form, keepAfterUnmount],
  );

  return form;
};
