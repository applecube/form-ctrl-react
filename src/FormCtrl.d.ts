import type { FormCtrl as FormCtrlVanilla, FormField, FormFieldData } from 'form-ctrl-vanilla/FormCtrl';
import type { StoreApi } from 'zustand';

type RerenderStoreApi = StoreApi<Record<FormField, number | undefined>>;

export class FormCtrl extends FormCtrlVanilla {
  protected readonly _rerenderStore: RerenderStoreApi;

  protected rerenderFields(fields?: FormField | FormField[]): void;

  subscribeToField(field: FormField, callback: (data: FormFieldData) => void): () => void;

  useFieldRerender(field: FormField): number | undefined;

  useFieldData(field: FormField): FormFieldData;
}

export type * from 'form-ctrl-vanilla/FormCtrl';
