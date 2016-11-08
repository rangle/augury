import {Path} from '../tree';

export type Apply = (path: Path, value) => void;

export const recurse = (initialPath: Path, object, exec: Apply) => {
  const visited = new Set();

  const apply = (path: Path, value, fn: Apply) => {
    if (value == null || visited.has(value)) {
      return;
    }

    visited.add(value);

    fn(path, value);

    if (Array.isArray(value) || value instanceof Set) {
      (<any>value).forEach((v, k) => apply(path.concat([k]), v, fn));
    }
    else if (value instanceof Map) {
      value.forEach((v, k) => apply(path.concat([k]), v, fn));
    }
    else {
      Object.keys(value).forEach(k => apply(path.concat([k]), value[k], fn));
    }
  };

  apply(initialPath, object, exec);
};
