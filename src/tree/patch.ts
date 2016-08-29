// This code contains work that is copyrighted to Joachim Wester (2013)
// and is licensed under the unrestrictive MIT software license.
//
// The original code is available at https://github.com/Starcounter-Jack/JSON-Patch
//
// Modified to disable deep cloning which causes exceptions on high-depth component
// trees and is not necessary for our use-case.

import {Change} from './change';

const objectKeys = function (obj) {
  if (Array.isArray(obj)) {
    const keys = new Array(obj.length);

    for (let k = 0; k < keys.length; k++) {
      keys[k] = k.toString();
    }

    return keys;
  }

  if (Object.keys) {
    return Object.keys(obj);
  }

  const keys = [];

  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      keys.push(i);
    }
  }

  return keys;
};

function equals(a, b) {
  switch (typeof a) {
    case 'undefined':
    case 'boolean':
    case 'string':
    case 'number':
      return a === b;
    case 'object':
      if (a === null) {
        return b === null;
      }
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
          return false;
        }

        for (let i = 0, l = a.length; i < l; i++) {
          if (!equals(a[i], b[i])) {
            return false;
          }
        }

        return true;
      }

      const keys = objectKeys(b);
      const length = keys.length;

      if (objectKeys(a).length !== length) {
        return false;
      }

      for (let i = 0; i < length; i++) {
        if (!equals(a[i], b[i])) {
          return false;
        }
      }

      return true;

    default:
      return false;
  }
}

const operations = {
  add(obj, key) {
    obj[key] = this.value;
  },
  remove(obj, key) {
    const removed = obj[key];
    delete obj[key];
    return removed;
  },
  replace(obj, key) {
    const removed = obj[key];
    obj[key] = this.value;
    return removed;
  },
  move: function (obj, key, tree) {
    const getOriginalDestination : any = {op: '_get', path: this.path};
    apply(tree, [getOriginalDestination]);

    // In case value is moved up and overwrites its ancestor
    const original = getOriginalDestination.value === undefined ?
        undefined : JSON.parse(JSON.stringify(getOriginalDestination.value));

    const tempOperation = {op: '_get', path: this.from};
    apply(tree, [tempOperation]);

    apply(tree, [
      {op: 'remove', path: this.from}
    ]);
    apply(tree, [
      {op: 'add', path: this.path, value: (<any> tempOperation).value}
    ]);
    return original;
  },
  copy: function (obj, key, tree) {
    const temp = {op: '_get', path: this.from};
    apply(tree, [temp]);
    apply(tree, [
      {op: 'add', path: this.path, value: (<any>temp).value}
    ]);
  },
  test(obj, key) {
    return equals(obj[key], this.value);
  },
  _get(obj, key) {
    this.value = obj[key];
  }
};

const arrayOperations = {
  add(arr, i) {
    arr.splice(i, 0, this.value);
    return i;
  },
  remove(arr, i) {
    const removedList = arr.splice(i, 1);
    return removedList[0];
  },
  replace(arr, i) {
    const removed = arr[i];
    arr[i] = this.value;
    return removed;
  },
  move: operations.move,
  copy: operations.copy,
  test: operations.test,
  _get: operations._get
};

const rootOperations = {
  add: function (obj) {
    rootOperations.remove.call(this, obj);
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        obj[key] = this.value[key];
      }
    }
  },
  remove: function (obj) {
    const removed = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        removed[key] = obj[key];
        operations.remove.call(this, obj, key);
      }
    }
    return removed;
  },
  replace: function (obj) {
    const removed = apply(obj, [
      {op: 'remove', path: this.path}
    ]);
    apply(obj, [
      {op: 'add', path: this.path, value: this.value}
    ]);
    return removed[0];
  },
  move: operations.move,
  copy: operations.copy,
  test: function (obj) {
    return (JSON.stringify(obj) === JSON.stringify(this.value));
  },
  _get: function (obj) {
    this.value = obj;
  }
};

export function apply(tree, patches: Array<any>, validate?: boolean): Array<any> {
  const results = new Array(patches.length);
  const plen = patches.length;
  let p = 0, patch, key;
  while (p < plen) {
    patch = patches[p];
    p++;

    const path = patch.path || '';
    const keys = path.split('/');
    const len = keys.length;
    let obj = tree;
    let t = 1;
    let existingPathFragment = undefined;

    while (true) {
      key = keys[t];

      if (validate) {
        if (existingPathFragment === undefined) {
          if (obj[key] === undefined) {
            existingPathFragment = keys.slice(0, t).join('/');
          }
          else if (t === len - 1) {
            existingPathFragment = patch.path;
          }
          if (existingPathFragment !== undefined) {
            this.validator(patch, p - 1, tree, existingPathFragment);
          }
        }
      }

      t++;
      if (key === undefined) { // is root
        if (t >= len) {
          results[p - 1] = rootOperations[patch.op].call(patch, obj, key, tree); // Apply patch
          break;
        }
      }
      if (Array.isArray(obj)) {
        if (key === '-') {
          key = obj.length;
        }
        else {
          if (validate && !isInteger(key)) {
            throw new JsonPatchError('Expected an unsigned base-10 integer value',
              'OPERATION_PATH_ILLEGAL_ARRAY_INDEX', p - 1, patch.path, patch);
          }
          key = parseInt(key, 10);
        }
        if (t >= len) {
          if (validate && patch.op === 'add' && key > obj.length) {
            throw new JsonPatchError('The specified index is out of range',
              'OPERATION_VALUE_OUT_OF_BOUNDS', p - 1, patch.path, patch);
          }
          results[p - 1] = arrayOperations[patch.op].call(patch, obj, key, tree);
          break;
        }
      }
      else {
        if (key && key.indexOf('~') >= 0) {
          key = key.replace(/~1/g, '/').replace(/~0/g, '~');
        }
        if (t >= len) {
          results[p - 1] = operations[patch.op].call(patch, obj, key, tree);
          break;
        }
      }
      obj = obj[key];
    }
  }
  return results;
}

export class JsonPatchError extends Error {
  constructor(
    public message: string,
    public name: string,
    public index?: number,
    public operation?,
    public tree?
  ) {
    super(message);
  }
}

function hasUndefined(obj): boolean {
  if (obj === undefined) {
      return true;
  }

  if (typeof obj === 'array' || typeof obj === 'object') {
    for (const i in obj) {
      if (hasUndefined(obj[i])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates a single operation. Called from `validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [tree] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `tree`
 */
export function validator(operation, index: number, tree?, existingPathFragment?: string) {
  if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
    throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, tree);
  }

  else if (!operations[operation.op]) {
    throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902',
      'OPERATION_OP_INVALID', index, operation, tree);
  }

  else if (typeof operation.path !== 'string') {
    throw new JsonPatchError('Operation `path` property is not a string',
      'OPERATION_PATH_INVALID', index, operation, tree);
  }

  else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
    throw new JsonPatchError('Operation `from` property is not present',
      'OPERATION_FROM_REQUIRED', index, operation, tree);
  }

  else if ((operation.op === 'add'
            || operation.op === 'replace'
            || operation.op === 'test')
          && operation.value === undefined) {
    throw new JsonPatchError('Operation `value` property is not present',
      'OPERATION_VALUE_REQUIRED', index, operation, tree);
  }

  else if ((operation.op === 'add'
            || operation.op === 'replace'
            || operation.op === 'test')
          && hasUndefined(operation.value)) {
    throw new JsonPatchError('Operation `value` property is not present',
      'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, tree);
  }

  else if (tree) {
    if (operation.op === 'add') {
      const pathLen = operation.path.split('/').length;
      const existingPathLen = existingPathFragment.split('/').length;
      if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
        throw new JsonPatchError('Cannot perform an `add` operation at the desired path',
          'OPERATION_PATH_CANNOT_ADD', index, operation, tree);
      }
    }
    else if (operation.op === 'replace'
         || operation.op === 'remove'
         || operation.op === '_get') {
      if (operation.path !== existingPathFragment) {
        throw new JsonPatchError('Cannot perform the operation at a path that does not exist',
          'OPERATION_PATH_UNRESOLVABLE', index, operation, tree);
      }
    }
  }
}

function escapePathComponent (str) {
  if (str.indexOf('/') < 0 &&
      str.indexOf('~') < 0) {
    return str;
  }
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}

function getPathRecursive(root: Object, obj: Object): string {
  let found;

  for (const key in root) {
    if (root.hasOwnProperty(key)) {
      if (root[key] === obj) {
        return escapePathComponent(key) + '/';
      }
      else if (typeof root[key] === 'object') {
        found = getPathRecursive(root[key], obj);
        if (found !== '') {
          return `${escapePathComponent(key)}/${found}`;
        }
      }
    }
  }

  return '';
}

function getPath(root, obj): string {
  if (root === obj) {
    return '/';
  }
  const path = getPathRecursive(root, obj);
  if (path === '') {
    throw new Error('Object not found in root');
  }
  return '/' + path;
}

const beforeDict = [];

class Mirror {
  obj;
  observers = [];

  constructor(obj) {
    this.obj = obj;
  }
}

class ObserverInfo {
  callback;
  observer;

  constructor(callback, observer) {
    this.callback = callback;
    this.observer = observer;
  }
}

function getMirror(obj) {
  for (let i = 0, ilen = beforeDict.length; i < ilen; i++) {
    if (beforeDict[i].obj === obj) {
      return beforeDict[i];
    }
  }
}

function getObserverFromMirror(mirror, callback) {
  for (let j = 0, jlen = mirror.observers.length; j < jlen; j++) {
    if (mirror.observers[j].callback === callback) {
      return mirror.observers[j].observer;
    }
  }
}

function removeObserverFromMirror(mirror, observer) {
  for (let j = 0, jlen = mirror.observers.length; j < jlen; j++) {
    if (mirror.observers[j].observer === observer) {
      mirror.observers.splice(j, 1);
      return;
    }
  }
}

export function unobserve(root, observer) {
  observer.unobserve();
}


export function generate(observer) {
  let mirror;
  for (let i = 0, ilen = beforeDict.length; i < ilen; i++) {
    if (beforeDict[i].obj === observer.object) {
      mirror = beforeDict[i];
      break;
    }
  }
  internalGenerate(mirror.value, observer.object, observer.patches, '');
  if (observer.patches.length) {
    apply(mirror.value, observer.patches);
  }

  const temp = observer.patches;

  if (temp.length > 0) {
    observer.patches = [];
    if (observer.callback) {
      observer.callback(temp);
    }
  }
  return temp;
}

function internalGenerate(mirror, obj, patches, path) {
  const newKeys = objectKeys(obj);
  const oldKeys = objectKeys(mirror);

  let changed = false;
  let deleted = false;

  for (let t = oldKeys.length - 1; t >= 0; t--) {
    const key = oldKeys[t];
    const oldVal = mirror[key];

    if (obj.hasOwnProperty(key) && !(obj[key] === undefined && Array.isArray(obj) === false)) {
      const newVal = obj[key];
      if (typeof oldVal === 'object' && oldVal != null && typeof newVal === 'object' && newVal != null) {
        internalGenerate(oldVal, newVal, patches, path + '/' + escapePathComponent(key));
      }
      else {
        if (oldVal !== newVal) {
          changed = true;
          patches.push({op: 'replace', path: path + '/' + escapePathComponent(key), value: newVal});
        }
      }
    }
    else {
      patches.push({op: 'remove', path: path + '/' + escapePathComponent(key)});
      deleted = true; // property has been deleted
    }
  }

  if (!deleted && newKeys.length === oldKeys.length) {
    return;
  }

  for (let t = 0; t < newKeys.length; t++) {
    const key = newKeys[t];
    if (!mirror.hasOwnProperty(key) && obj[key] !== undefined) {
      patches.push({op: 'add', path: path + '/' + escapePathComponent(key), value: obj[key]});
    }
  }
}

function isInteger(str: string): boolean {
  const len = str.length;

  let i = 0;

  let charCode;

  while (i < len) {
    charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      i++;
      continue;
    }
    return false;
  }
  return true;
}

export function compare(tree1, tree2): Array<Change> {
  const patches = [];
  internalGenerate(tree1, tree2, patches, '');
  return patches;
}
