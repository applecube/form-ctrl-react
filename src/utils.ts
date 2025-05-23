import React from 'react';

export const useValueChanged = (value: unknown): boolean => {
  const memoRef = React.useRef(value);
  const changed = memoRef.current !== value;
  memoRef.current = value;
  return changed;
};

export * from 'form-ctrl-vanilla/utils';
