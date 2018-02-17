let diagService;

export function useService(s) {
  diagService = s;
}

export function diagnosable(
    { pre = undefined, post = undefined }
  = { pre: undefined,  post: undefined  }
) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const func = descriptor.value;
      descriptor.value = function (...args) {
        diagService.actions.log({ txt: 'executing method: ' + propertyKey })
        if (pre) pre(diagService).apply(this, args);
        const result = func.apply(this, args);
        if (post) post(diagService).apply(this, [ result, ...args ]);
        return result;
      }
      return descriptor;
    }
}
