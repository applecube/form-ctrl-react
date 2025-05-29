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
} from './FormCtrl.js';
import { useValueChanged } from './utils.js';

export interface ChildBaseProps {
  name?: string;
  required?: boolean;
  onChange?: (e: unknown) => void;
  onBlur?: (e?: unknown) => void;
}

export interface ControlledChildBaseProps<V = unknown> extends ChildBaseProps, FormFieldData<V> {}

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

  // intersection with ChildBaseProps
  /**
   * Will be passed to child `name` prop. If not specified - `field` will be passed.
   */
  name?: string;
  required?: FormFieldRequired;
  onChange?: (e: unknown) => void;
  onBlur?: (e?: unknown) => void;
}

export interface WithFormParams extends FormFieldBaseProps {
  requiredValidate?: FormFieldRequiredValidate;
}

type ChildComponent<P> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>;

type FormFieldProps<P> = Omit<P, keyof FormFieldBaseProps | keyof ChildBaseProps> &
  FormFieldBaseProps;

type FormFieldControlledProps<P> = Omit<
  P,
  keyof FormFieldBaseProps | keyof ControlledChildBaseProps
> &
  FormFieldBaseProps;

type FormFieldComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<FormFieldProps<P>> &
    React.RefAttributes<React.ComponentRef<ChildComponent<P>>>
>;

type FormFieldControlledComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<FormFieldControlledProps<P>> &
    React.RefAttributes<React.ComponentRef<ChildComponent<P>>>
>;

const useFieldForm = <P extends FormFieldBaseProps>(
  props: P,
  params: WithFormParams,
): {
  form: FormCtrl;
  field: FormField;
  childBaseProps: ChildBaseProps;
  otherChildProps: Omit<P, keyof FormFieldBaseProps>;
} => {
  const {
    form: formProp = params.form,
    field: fieldProp = params.field,
    name = params.name,
    messages = params.messages,
    required = params.required,
    validation = params.validation,
    onChange: onChangeProp,
    onBlur: onBlurProp,
    ...otherChildProps
  } = props;

  const field = fieldProp || '_unknown_field_';

  const formRef = React.useRef<FormCtrl | undefined>();
  if (!formRef.current) {
    formRef.current =
      formProp instanceof FormCtrl
        ? formProp
        : FormCtrl.get<FormCtrl>(formProp) ||
          FormCtrl.get<FormCtrl>('_unknown_') ||
          new FormCtrl('_unknown_');

    const form = formRef.current;

    if (messages) form.resetFieldMessages(field, messages, { skipRerender: true });

    form.setFieldValidation(field, {
      requiredValidate: params.requiredValidate,
      ...validation,
      required,
    });
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

  const childBaseProps: ChildBaseProps = {
    name: String(name || field),
    required: Boolean(required),
    onChange,
    onBlur,
  };

  return { form, field, childBaseProps, otherChildProps };
};

/**
 * Wrap Component with FormField component. Wire Component to form with onChange, onBlur.
 *
 * Component should not have reserved props such as `form`, `field`, `messages`, `validation`.
 */
export const withForm = <P extends ChildBaseProps>(
  Component: ChildComponent<P>,
  params: WithFormParams = {},
): FormFieldComponent<P> => {
  const FormField: FormFieldComponent<P> = React.forwardRef<
    React.ComponentRef<typeof Component>,
    FormFieldProps<P>
  >(function FormField(props, ref) {
    const { childBaseProps, otherChildProps } = useFieldForm(props, params);

    return <Component {...(otherChildProps as unknown as P)} {...childBaseProps} ref={ref} />;
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
export const withFormControlled = <V, P extends ControlledChildBaseProps<V>>(
  Component: ChildComponent<P>,
  params: WithFormParams = {},
): FormFieldControlledComponent<P> => {
  const FormField: FormFieldControlledComponent<P> = React.forwardRef<
    React.ComponentRef<typeof Component>,
    FormFieldControlledProps<P>
  >(function FormField(props, ref) {
    const { form, field, childBaseProps, otherChildProps } = useFieldForm(props, params);

    const fieldData = form.useFieldData<V>(field);

    return (
      <Component
        {...(otherChildProps as unknown as P)}
        {...childBaseProps}
        {...fieldData}
        ref={ref}
      />
    );
  });

  return FormField;
};
