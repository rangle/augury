// Checks to see if the property path exists. Used mostly in the transformer functions for
// checking the existence of certain nested properties in the angular debug object, which
// may change in the future.
export const pathExists = (object: any, ...args: any[]): boolean => {
  return getAtPath(object, ...args).exists;
};

export const getAtPath = (obj: any, ...args: any[]): any => {
  for (let i = 0; i < args.length; i++) {
    if (!obj || !(args[i] in obj)) {
      return { exists: false, value: void 0 };
    }

    obj = obj[args[i]];
  }
  return {
    exists: true,
    value: obj,
  };
};
