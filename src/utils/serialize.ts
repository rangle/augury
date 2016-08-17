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
      // object or function
      var stype = Object.prototype.toString.call(value);
      // apparently Chrome <= 12 is nonconformant and returns typeof /regexp/ as 'function'
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
//            console.log('Circular dependency from ' + parent + ' to ' + index);
            return new Reference(index);
          } else {
            index = seenObjs.length;
            seenObjs.push(value);
//            console.log('Seen', index, (value.a ? value.a : ( value.b ? value.b : '')));
          }

          if(stype === '[object Array]') {
            objects[index] = '[' + value.map(function(i, key) {
              var val = implode(i);
//              console.log('array!!!', i, val);
              if(val instanceof Reference) {
                val.from = index;
                val.key = key;
                arrRefs.push(val);
                return 'null'; // placeholder
              } else {
                return val;
              }
            }) +']';
//           } else if(value.serialize && typeof value.serialize === 'function') {
//             var parts = value.serialize();
// //            console.log('parts:', parts);
//             // objects with custom serialization are always created empty
//             objects[index] = 'new ' +parts.shift()+'()';
//             // all the parameters from the serialize call need to be translated into deserialize calls later on
//             deserializeParams[index] = parts.map(function(item, key) {
//               var val = implode(item, index);
// //              console.log('val', val);
//               if(val instanceof Reference) {
//                 val.from = index;
//                 val.isObject = true;
//               }
//               return val;
//             });
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

  return '(function() { var Obj = [' + objects.join(',')+'];\n' +

          // array deserialization

          arrRefs.map(function(link) {
            return 'Obj['+link.from+']['+link.key+'] = Obj['+link.to+'];';
          }).join('\n')+

          // hash deserialiazation

          hashRefs.map(function(link) {
            return 'Obj['+link.from+']['+JSON.stringify(link.key)+'] = Obj['+link.to+'];';
          }).join('\n')+

          // object deserialization

          deserializeParams.map(function(init, index) {
            return 'Obj['+index+'].deserialize('+init.map(function(val){
                if(val instanceof Reference && val.isObject) {
                  return 'Obj['+val.to+']';
                } else {
                  return val;
                }
              }).join(',')+');'
          }).join('\n')+
          '\n return Obj[0];}());';
}

export const serialize = value => snapshot(value);

export const deserialize = value => eval(value);
