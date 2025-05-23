import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { FormCtrl as FormCtrlVanilla } from 'form-ctrl-vanilla/FormCtrl';
import { ensureArray } from 'form-ctrl-vanilla/utils';

import type { FormConstructorOptions, FormField, FormFieldData, FormId } from 'form-ctrl-vanilla/FormCtrl';
import type { StoreApi } from 'zustand';

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

  useFieldData(field: FormField): FormFieldData {
    this.useFieldRerender(field);
    return this.getFieldData(field);
  }
}

// must be at the end so FormCtrl above is exported instead of vanilla FormCtrl
export type * from 'form-ctrl-vanilla/FormCtrl';
