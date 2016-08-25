/// The intent of this function is to create a function that is itself able to
/// reconstruct {@param object} into an exact clone that includes circular
/// references and objects that are not normally serializable by something like
/// {@link JSON.serialize}. It returns a string containing the code for the
/// reconstructor function. That value can be passed to a Function constructor
/// which will parse it into a function that can then be invoked to recreate
/// the original object. In this way we are able to serialize an object for
/// transmission across thread boundaries even if it is very complex and
/// contains `unserializable' constructs (like circular references). This is
/// used in our message passing operations to reliably send complex objects.
const metaCreator = object => {
  const arrays = [];
  const hashes = [];
  const objref = [];
  const visits = [];

  function ReferenceDescription(to) {
    this.from = null;
    this.to = to;
  }

  function map(value, parent?) {
    const type = typeof value;

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

        const objectType = Object.prototype.toString.call(value);

        switch (objectType) {
          case '[object RegExp]':
            return value.toString();
          case '[object Date]':
            return `new Date(${value.valueOf()})`;
          default:
            if (/Element/.test(objectType)) {
              return null; // cannot serialize DOM elements
            }
            return objectMapper(objectType);
        }
    }

    function objectMapper(objectType: string) {
      /// If this is a function, there is really no way to serialize
      /// it in a way that will include its original context and
      /// closures. Therefore instead of attempting to do that, we
      /// just create an object of the same name.
      if (type === 'function') {
        return `function ${value.name}() {}`;
      }

      let index = visits.indexOf(value);
      if (index >= 0) {
        return new ReferenceDescription(index);
      }
      else {
        index = visits.length;
        visits.push(value);
      }

      switch (objectType) {
        case '[object Array]':
          objref[index] = `[${value.map((i: number, key) => {
            const ref = map(i);

            if (ref instanceof ReferenceDescription) {
              ref.from = index;
              ref.key = key;
              arrays.push(ref);
              return 'null';
            }
            else {
              return ref;
            }
          })}]`;
          break;
        default:
          objref[index] = `{${Object.keys(value).map(key => {
            const mapped = map(value[key], index);

            if (mapped instanceof ReferenceDescription) {
              mapped.from = index;
              mapped.key = key;
              hashes.push(mapped);
              return mapped;
            }

            return `${JSON.stringify(key)}: ${mapped}`;
          }).filter(
            v => v instanceof ReferenceDescription === false).join(',')}}`;
          break;
      }

      return new ReferenceDescription(index);
    }
  }

  /// Start the mapping operation at the root.
  map(object, 0);

  /// Return a string representation of the recreator function. The result must
  /// be parseable JavaScript code that can be provided to `new Function()' to
  /// create a function that can recreate the object.
  return `function() {
    var _ = [${objref.join(',')}];
      ${arrays.map(link =>
      `_[${link.from}][${link.key}] = _[${link.to}];`).join('')}

      ${hashes.map(link =>
      `_[${link.from}][${JSON.stringify(link.key)}] = _[${link.to}];`).join('')}

      return _[0];
    }();`;
};

/// Serialize a complex object into a function that can recreate the object.
export const serialize = value => `return ${metaCreator(value)}`;

/// Deserialize a function string and invoke the resulting object recreator.
export const deserialize = value => (new Function(value))();

/// Use the object recreator to create a clone of a complex object
export const complexClone = value => deserialize(serialize(value));
