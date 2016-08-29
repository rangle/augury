// This code contains work that is copyrighted to Joachim Wester (2013)
// and is licensed under the unrestrictive MIT software license.
//
// The original code is available at https://github.com/Starcounter-Jack/JSON-Patch
//
// This code has been forked and heavily modified for performance.

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

      const keys = Object.keys(b);

      const length = keys.length;

      if (Object.keys(a).length !== length) {
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

const objectOperations = {
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
    const destination : any = {op: '_get', path: this.path};
    apply(tree, [destination]);

    // In case value is moved up and overwrites its ancestor
    const original = destination.value === undefined
        ? undefined
        : JSON.parse(JSON.stringify(destination.value));

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
  move: objectOperations.move,
  copy: objectOperations.copy,
  test: objectOperations.test,
  _get: objectOperations._get
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
        objectOperations.remove.call(this, obj, key);
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
  move: objectOperations.move,
  copy: objectOperations.copy,
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
          key = parseInt(key, 10);
        }
        if (t >= len) {
          results[p - 1] = arrayOperations[patch.op].call(patch, obj, key, tree);
          break;
        }
      }
      else {
        if (key && key.indexOf('~') >= 0) {
          key = key.replace(/~1/g, '/').replace(/~0/g, '~');
        }
        if (t >= len) {
          results[p - 1] = objectOperations[patch.op].call(patch, obj, key, tree);
          break;
        }
      }
      obj = obj[key];
    }
  }
  return results;
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

function escapePathComponent (str) {
  if (str.indexOf('/') < 0 &&
      str.indexOf('~') < 0) {
    return str;
  }
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}

function generatePatch(mirror, obj, patches, path) {
  const newKeys = Object.keys(obj);
  const oldKeys = Object.keys(mirror);

  let changed = false;
  let deleted = false;

  for (let t = oldKeys.length - 1; t >= 0; t--) {
    const key = oldKeys[t];
    const oldVal = mirror[key];

    if (obj.hasOwnProperty(key) && !(obj[key] === undefined && Array.isArray(obj) === false)) {
      const newVal = obj[key];
      if (typeof oldVal === 'object' && oldVal != null && typeof newVal === 'object' && newVal != null) {
        generatePatch(oldVal, newVal, patches, path + '/' + escapePathComponent(key));
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

export function compare(tree1, tree2): Array<any> {
  const patches = [];
  generatePatch(tree1, tree2, patches, '');
  return patches;
}
