import React from 'react';

export const useValueChanged = (value) => {
  const memoRef = React.useRef(value);
  const changed = memoRef.current !== value;
  memoRef.current = value;
  return changed;
};

export const useFixed = (value) => React.useRef(value).current;
