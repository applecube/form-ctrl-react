import React from 'react';
import {
  FormCtrl,
  type FormField,
  type FormFieldData,
  type FormFieldMessage,
  type FormFieldRequired,
  type FormFieldRequiredValidate,
  type FormFieldValidation,
  type FormId,
} from './FormCtrl';
import { useValueChanged } from './utils';

export interface FormFieldChildBaseProps {
  name?: string;
  required?: boolean;
  onChange?: (e: unknown) => void;
  onBlur?: (e: unknown) => void;
}

export interface FormFieldControlledChildBaseProps<V = unknown>
  extends FormFieldBaseProps,
    FormFieldData<V> {}

export interface FormFieldBaseProps {
  /**
   * Form control object or id. Required if no `form` passed to `withForm` params.
   */
  form?: FormId | FormCtrl;
  /**
   * Form field key. Required if no `field` passed to `withForm` params.
   */
  field?: FormField;
  validation?: FormFieldValidation;
  messages?: FormFieldMessage[];

  // intersection with FormFieldChildBaseProps
  /**
   * Will be passed to child `name` prop. If not specified - `field` will be passed.
   */
  name?: string;
  required?: FormFieldRequired;
  onChange?: (e: unknown) => void;
  onBlur?: (e: unknown) => void;
}

export interface WithFormParams extends FormFieldBaseProps {
  requiredValidate?: FormFieldRequiredValidate;
}

type ChildComponent<P> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>;

type FormFieldChildBasePassedProps<P> = Omit<P, keyof FormFieldBaseProps | keyof FormFieldChildBaseProps> &
  FormFieldChildBaseProps;

type FormFieldProps<P> = Omit<P, keyof FormFieldBaseProps> & FormFieldBaseProps;

type FormFieldComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<FormFieldProps<P>> &
    React.RefAttributes<React.ComponentRef<ChildComponent<FormFieldChildBasePassedProps<P>>>>
>;

const useFieldForm = <P extends FormFieldBaseProps>(
  props: P,
  params: WithFormParams,
): { form: FormCtrl; field: FormField; childBaseProps: FormFieldChildBasePassedProps<P> } => {
  const {
    form: formProp = params.form,
    field: fieldProp = params.field,
    name = params.name,
    messages = params.messages,
    required = params.required,
    validation = params.validation,
    onChange: onChangeProp,
    onBlur: onBlurProp,
    ...otherProps
  } = props;

  const field = fieldProp || '_unknown_field_';

  const formRef = React.useRef<FormCtrl>(null);
  if (!formRef.current) {
    formRef.current =
      formProp instanceof FormCtrl
        ? formProp
        : FormCtrl.get<FormCtrl>(formProp) ||
          FormCtrl.get<FormCtrl>('_unknown_') ||
          new FormCtrl('_unknown_');

    const form = formRef.current;

    if (messages) form.resetFieldMessages(field, messages, { skipRerender: true });
    form.setFieldValidation(field, { requiredValidate: params.requiredValidate, ...validation, required });
  }
  const form = formRef.current;

  // useValueChanged as React hook must be first, because must be invoked at each rerender
  if (useValueChanged(messages) && messages) {
    form.resetFieldMessages(field, messages, { skipRerender: true });
  }
  if (useValueChanged(validation) && validation) {
    form.setFieldValidation(field, validation);
  }
  if (useValueChanged(required)) {
    form.setFieldValidation(field, { required });
  }

  const onChange = (e: unknown) => {
    onChangeProp?.(e);
    form.handleChange(field, e);
  };

  const onBlur = (e: unknown) => {
    onBlurProp?.(e);
    form.handleBlur(field);
  };

  const childBaseProps: FormFieldChildBasePassedProps<P> = {
    ...otherProps,
    name: String(name || field),
    required: Boolean(required),
    onChange,
    onBlur,
  };

  return { form, field, childBaseProps };
};

/**
 * Wrap Component with FormField component. Wire Component to form with onChange, onBlur.
 *
 * Component should not have reserved props such as `form`, `field`, `messages`, `validation`.
 */
export const withForm = <P extends FormFieldChildBaseProps>(
  Component: ChildComponent<FormFieldChildBasePassedProps<P>>,
  params: WithFormParams = {},
): FormFieldComponent<P> => {
  const FormField: FormFieldComponent<P> = React.forwardRef<
    React.ComponentRef<typeof Component>,
    FormFieldProps<P>
  >(function FormField(props, ref) {
    const { childBaseProps } = useFieldForm(props, params);

    return <Component {...(childBaseProps as any)} ref={ref} />;
  });

  return FormField;
};

/**
 * Wrap Component with FormField component. Wire Component to form with onChange, onBlur.
 *
 * Trigger rerender on `FormFieldData` change.
 *
 * Component should not have reserved props such as `form`, `field`, `validation`.
 *
 * Component should have injected props such as `value`, `messages`, `error`, `warning`, `required`.
 */
export const withFormControlled = <P extends FormFieldControlledChildBaseProps>(
  Component: ChildComponent<FormFieldChildBasePassedProps<P>>,
  params: WithFormParams = {},
): FormFieldComponent<P> => {
  const FormField: FormFieldComponent<P> = React.forwardRef<
    React.ComponentRef<typeof Component>,
    FormFieldProps<P>
  >(function FormField(props, ref) {
    const { form, field, childBaseProps } = useFieldForm(props, params);

    const fieldData = form.useFieldData(field);

    return <Component {...(childBaseProps as any)} {...fieldData} ref={ref} />;
  });

  return FormField;
};
