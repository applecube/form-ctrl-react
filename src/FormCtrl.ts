import { useStore, type StoreApi } from 'zustand';
import { createStore } from 'zustand/vanilla';

import {
  FormCtrl as FormCtrlVanilla,
  type FormConstructorOptions,
  type FormField,
  type FormFieldData,
  type FormId,
} from 'form-ctrl-vanilla';
import { ensureArray } from 'form-ctrl-vanilla/utils';

type RerenderStoreApi = StoreApi<Record<FormField, number | undefined>>;

export class FormCtrl extends FormCtrlVanilla {
  protected readonly _rerenderStore: RerenderStoreApi;

  constructor(formId: FormId, options?: FormConstructorOptions) {
    super(formId, options);
    this._rerenderStore = createStore(() => ({}));
  }

  rerenderFields(fields?: FormField | FormField[]): void {
    this._rerenderStore.setState((storeState) => {
      const _fields = fields ? ensureArray(fields) : this._valuesMap.keys();
      const newStoreState: Record<FormField, number | undefined> = {};
      for (const field of _fields) {
        newStoreState[field] = storeState[field] ? storeState[field] + 1 : 1;
      }
      return newStoreState;
    }, !fields as true);
  }

  subscribeToField(field: FormField, callback: (data: FormFieldData) => void): () => void {
    return this._rerenderStore.subscribe((state, prevState) => {
      if (state[field] !== prevState[field]) callback(this.getFieldData(field));
    });
  }

  useFieldRerender(field: FormField): number | undefined {
    return useStore(this._rerenderStore, (storeState) => storeState[field]);
  }

  useFieldData<V = unknown>(field: FormField): FormFieldData<V> {
    this.useFieldRerender(field);
    return this.getFieldData<V>(field);
  }
}

export type * from 'form-ctrl-vanilla/types';
