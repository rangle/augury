export const isScalar = value => {
  switch (typeof value) {
    case 'string':
    case 'boolean':
    case 'function':
    case 'undefined':
      return true;
    default:
      return false;
  }
};
