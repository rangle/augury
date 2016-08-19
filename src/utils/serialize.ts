function snapshot(scope) {
  const visited = [];
  const objects = [];
  const arrays = [];
  const hashes = [];
  const params = [];

  function Reference(to) {
    this.from = null;
    this.to = to;
  }

  function implode(value, parent?) {
    var type = typeof value;

    switch (type) {
      case 'string':
        return JSON.stringify(value);
      case 'number':
      case 'boolean':
        return value;
      case 'undefined':
        return 'undefined';
      default:
        if (value === null) {
          return 'null';
        }

        const stype = Object.prototype.toString.call(value);
        switch (stype) {
          case '[object RegExp]':
            return value.toString();
          case '[object Date]':
            return `new Date(${value.valueOf()})`;
          default:
            if (/Element/.test(stype)) {
              return null; // cannot serialize DOM elements
            }

            // non-native object or function
            if (type === 'function') {
              return `function ${value.name}() {}`;
            }
            let index = visited.indexOf(value);
            if (index > -1) {
              return new Reference(index);
            } else {
              index = visited.length;
              visited.push(value);
            }

            if (stype === '[object Array]') {
              objects[index] = `[${value.map((i: number, key) => {
                const val = implode(i);
                if (val instanceof Reference) {
                  val.from = index;
                  val.key = key;
                  arrays.push(val);
                  return 'null';
                }
                return val;
              })}]`;
            } else {
              objects[index] = `{${Object.keys(value).map(key => {
                var val = implode(value[key], index);
                if (val instanceof Reference) {
                  // hash keys that are references need to be materialized later
                  val.from = index;
                  val.key = key;
                  hashes.push(val);
                  return val;
                } else {
                  return `${JSON.stringify(key)}: ${val}`;
                }
              }).filter(v => v instanceof Reference === false).join(',')}}`;
            }

            return new Reference(index);
        }
    }
  }

  var values = implode(scope, 0);

  return `(function() {
    var _ = [${objects.join(',')}];
      ${arrays.map(link =>
      `_[${link.from}][${link.key}] = _[${link.to}];`).join('')}

      ${hashes.map(link =>
      `_[${link.from}][${JSON.stringify(link.key)}] = _[${link.to}];`).join('')}

      ${params.map((init, index) =>
      `_[${index}].deserialize(${init.map(val => {
        if (val instanceof Reference && val.isObject) {
          return `_[${+val.to}]`;
        } else {
          return val;
        }
      }).join(',')}`).join('')};

      return _[0];
    }());`;
}

export const serialize = value => `return ${snapshot(value)}`;

export const deserialize = value => (new Function(value))();
