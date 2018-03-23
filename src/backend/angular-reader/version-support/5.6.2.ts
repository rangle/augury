const parameterTypes = (instance): Array<any> => {
  return Reflect.getOwnMetadata('design:paramtypes', instance.constructor)
    .map(param => param.name === 'Object' ? null : param);
}

export const V562 = {
  version: '5.6.2',
  parameterTypes,
}
