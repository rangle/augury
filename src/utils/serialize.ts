import { parse, stringify } from 'flatted';

/// The intent of serialize() is to create a function that is itself able to
/// reconstruct {@param object} into an exact clone that includes circular
/// references and objects that are not normally serializable by something like
/// {@link JSON.stringify}. It returns a string containing the code for the
/// reconstructor function. That value can be passed to a Function constructor
/// which will parse it into a function that can then be invoked to recreate
/// the original object. In this way we are able to serialize an object for
/// transmission across thread boundaries even if it is very complex and
/// contains `unserializable' constructs (like circular references). This is
/// used in our message passing operations to reliably send complex objects.

/// Serialize a complex object into a function that can recreate the object.
export const serialize = value => {
  return stringify(value);
};

/// Deserialize a function string and invoke the resulting object recreator.
export const deserialize = value => {
  return parse(value);
};
