# FORM-CTRL-REACT

Form control Map for multiple forms with field values, state, validation. React edition.
Based on [form-ctrl-vanilla](https://github.com/applecube/form-ctrl-vanilla).

## Install

`npm install form-ctrl-react`

## Usage

### formCtrl

Get and manipulate form in same way as in [form-ctrl-vanilla](https://github.com/applecube/form-ctrl-vanilla).

```js
import { formCtrl } from 'form-ctrl-react';

const form = formCtrl('form_id_1');
```

### useForm

Utility hook to work with form in react way.

`useForm` creates or gets existing form by id. Supports reactive full `values` and additional `addValues`.

```jsx
import { useForm } from 'form-ctrl-react/useForm';

export const App = () => {
  const form = useForm('form_id_1', {
    values: { prop1: 5, prop2: 'asd', prop3: ['a', 'b', 'c'] },
    addValues: { prop1: 6 },
    keepAfterUnmount: true,
    validation: {
      prop1: {
        eventName: 'onTouch',
        required: true,
        rules: [
          {
            type: 'error',
            message: 'More than 4',
            validate: (v) => Number.isInteger(v) && (v as number) > 4,
          },
        ],
      },
    },
  });

  return (
    <div>
      <input
        name='prop1'
        onChange={(e) => form.handleChange('prop1', e)}
        onBlur={() => form.handleBlur('prop1')}
      />
      <button onClick={() => form.validate()} />
    </div>
  );
}
```

### withForm

Convenient (I hope) HOC to wrap field components and wire them with form specified field.

`withForm` for uncontrolled wrapping.

`withFormControlled` for controlled wrapping.

```jsx
import { withFormControlled } from 'form-ctrl-react/withForm';
import { TextField } from 'ui';

const TextFormField = withFormControlled(TextField);
```
