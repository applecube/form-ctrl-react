import type { FormFieldRequiredValidate, FormId } from 'form-ctrl-vanilla';
import type React from 'react';
import type { FormCtrl, FormField } from './FormCtrl';

export interface WithFormOptions {
  controlled?: boolean;
  requiredValidate?: FormFieldRequiredValidate;
}

export function withForm<P extends { onChange?: (e: unknown) => void; onBlur?: (e: unknown) => void }>(
  Component: React.FC<P>,
  options?: WithFormOptions,
): React.FC<P & { form: FormId | FormCtrl; field: FormField }>;
