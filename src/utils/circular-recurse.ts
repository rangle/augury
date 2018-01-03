import {Path} from '../tree';

import {isScalar} from './scalar';

export type Apply = (value) => void;

// Recursive traversal of an object tree, but will not traverse circular references or DOM elements
export const recurse = (object, apply: Apply) => {
  const visited = new Set();

  const visit = value => {
    if (value == null ||
      isScalar(value) ||
      /Element/.test(Object.prototype.toString.call(value)) ||
      value.top === window) {
      return;
    }

    if (visited.has(value)) { // circular loop
      return;
    }

    visited.add(value);

    apply(value);

    if (Array.isArray(value) || value instanceof Set) {
      (<any>value).forEach((v, k) => visit(v));
    }
    else if (value instanceof Map) {
      value.forEach((v, k) => visit(v));
    }
    else {
      Object.keys(value).forEach(k => visit(value[k]));
    }
  };

  visit(object);
};
