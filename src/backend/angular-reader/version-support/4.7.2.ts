const injectedParameterDecorators = (instance): Array<any> => {
  return Reflect.getOwnMetadata('parameters', instance.constructor)
      || instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
}

export const V472 = {
  version: '4.7.2',
  injectedParameterDecorators,
}
