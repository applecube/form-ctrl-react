import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { FormCtrl as FormCtrlVanilla } from 'form-ctrl-vanilla/FormCtrl';
import { ensureArray } from 'form-ctrl-vanilla/utils';

export class FormCtrl extends FormCtrlVanilla {
  constructor(formId, options) {
    super(formId, options);
    this._rerenderStore = createStore(() => ({}));
  }

  rerenderFields(fields) {
    this._rerenderStore.setState((storeState) => {
      const _fields = fields ? ensureArray(fields) : this._valuesMap.keys();
      return _fields.reduce((result, field) => {
        result[field] = storeState[field] ? storeState[field] + 1 : 1;
        return result;
      }, {});
    }, !fields);
  }

  subscribeToField(field, callback) {
    return this._rerenderStore.subscribe((state, prevState) => {
      if (state[field] !== prevState[field]) callback(this.getFieldData(field));
    });
  }

  useFieldRerender(field) {
    return useStore(this._rerenderStore, (storeState) => storeState[field]);
  }

  useFieldData(field) {
    this.useFieldRerender(field);
    return this.getFieldData(field);
  }
}
