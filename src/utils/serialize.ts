const functionIsNative = (fn: Function) => {
  var toString = Object.prototype.toString;
  var fnToString = Function.prototype.toString;
  var reHostCtor = /^\[object .+?Constructor\]$/;

  var reNative = RegExp('^' +
    String(toString)
    .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
    .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  function isNative(value) {
    var type = typeof value;
    return type == 'function'
      ? reNative.test(fnToString.call(value))
      : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
  }

  return isNative(fn);
};

function snapshot(scope) {
  var seenObjs = [ ],
      objects = [ ],
      // three kinds of things can contain references to other objects: arrays, hashes and serializable objects
      // other values are primitives (potentially native types)
      arrRefs = [],
      hashRefs = [],
      deserializeParams = [];

  function Reference(to) {
    this.from = null;
    this.to = to;
  }

  function implode(value, parent?) {
    var type = typeof value;

    if(type === 'string') {
      return JSON.stringify(value);
    } else if (type === 'number' || type === 'boolean') {
      return value;
    } else if (type === 'undefined') {
      return 'undefined';
    } else {
      var stype = Object.prototype.toString.call(value);
      if(value === null) {
        return 'null';
      }
      if (stype === '[object RegExp]') {
        return value.toString();
      } else if (stype === '[object Date]') {
        return 'new Date('+value.valueOf()+')';
      } else if (/Element/.test(stype)) {
        return null;
      } else {
        // non-native object or function
        if(type === 'function') {
          return `function ${value.name}() {}`;
        } else {
          // object (can contain circular depencency)
          var index = seenObjs.indexOf(value);
          if(index > -1) {
            return new Reference(index);
          } else {
            index = seenObjs.length;
            seenObjs.push(value);
          }

          if(stype === '[object Array]') {
            objects[index] = '[' + value.map(function(i, key) {
              var val = implode(i);
              if(val instanceof Reference) {
                val.from = index;
                val.key = key;
                arrRefs.push(val);
                return 'null'; // placeholder
              } else {
                return val;
              }
            }) +']';
          } else {
            objects[index] = '{ ' + Object.keys(value).map(function(key) {
              var val = implode(value[key], index);
              if(val instanceof Reference) {
                // hash keys that are references need to be materialized later
                val.from = index;
                val.key = key;
                hashRefs.push(val);
                return val;
              } else {
                // hash keys that are not references can be stored directly
                return JSON.stringify(key) +': '+val;
              }
            }).filter(function(v) { return !(v instanceof Reference); }).join(',') + ' }';
          }

          return new Reference(index);

        }
      }
    }
  }

  var values = implode(scope, 0);

  return `(function() {
    var _ = [${objects.join(',')}];
      ${arrRefs.map(link =>
        `_[${link.from}][${link.key}] = _[${link.to}];`).join('')}

      ${hashRefs.map(link =>
        `_[${link.from}][${JSON.stringify(link.key)}] = _[${link.to}];`).join('')}

      ${deserializeParams.map((init, index) =>
        `_[${index}].deserialize(${init.map(val => {
            if(val instanceof Reference && val.isObject) {
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
