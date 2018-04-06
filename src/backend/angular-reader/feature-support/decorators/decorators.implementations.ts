export const classDecorators = (token): Array<any> => {
  // return Reflect.getOwnMetadata('annotations', token) || []; // this doesnt work for angular 5, it seems.
  // we want something like token.__annotations__
};

export const propertyDecorators = (instance): Array<any> => {
//  debugger;
  return Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];
};
