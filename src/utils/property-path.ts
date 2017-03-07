// Checks to see if the property path exists. Used mostly in the transformer functions for
// checking the existence of certain nested properties in the angular debug object, which
// may change in the future.
export const pathExists = (object: any, ...args: any[]): boolean => {
  for (let i = 0; i < args.length; i++) {
    if (!object || object[args[i]] === undefined) {
      return false;
    }

    object = object[args[i]];
  }

  return true;
};
