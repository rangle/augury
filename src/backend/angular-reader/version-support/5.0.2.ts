
const classDecorators = (token): Array<any> => {
  return Reflect.getOwnMetadata('annotations', token) || [];
}

const propertyDecorators = (instance): Array<any> => {
  return Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];
}

const parameterTypes = (instance): Array<any> => {
  return Reflect.getOwnMetadata('design:paramtypes', instance.constructor)
    .map(param => param.name === 'Object' ? null : param);
}

const injectedParameterDecorators = (instance): Array<any> => {
  return Reflect.getOwnMetadata('parameters', instance.constructor)
      || instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
}

export const V502 = {
  version: '5.0.2',
  classDecorators,
  propertyDecorators,
  parameterTypes,
  injectedParameterDecorators,
}
