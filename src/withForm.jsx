import React from 'react';
import { FormCtrl } from './FormCtrl';

export const withForm = (Component, { requiredValidate, controlled } = {}) => {
  const FormField = ({
    form: formProp,
    field,
    name,
    messages,
    required,
    validation,
    onChange: onChangeProp,
    onBlur: onBlurProp,
    ...otherProps
  }) => {
    const formRef = React.useRef();
    if (!formRef.current) {
      formRef.current =
        formProp instanceof FormCtrl ? formProp : FormCtrl.get(formProp) || new FormCtrl('_unknown_');

      const form = formRef.current;
      form.addFieldMessages(field, messages, { skipRerender: true });
      form.setFieldValidation(field, { requiredValidate, ...validation, required });
    }
    const form = formRef.current;

    let fieldData;
    if (controlled) fieldData = form.useFieldData(field);

    const onChange = (e) => {
      onChangeProp?.(e);
      form.handleChange(field, e);
    };

    const onBlur = (e) => {
      onBlurProp?.(e);
      form.handleBlur(field);
    };

    return (
      <Component
        {...otherProps}
        {...fieldData}
        name={name || field}
        required={Boolean(required)}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
  };

  return FormField;
};
