let service;

export function useService(s) {
  service = s;
}

export function diagnosable() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const func = descriptor.value;
      descriptor.value = function (...args) {
        if (service) {
          service.actions.log({ txt: 'running func: ' + ( func.name || propertyKey ) });
        }
        return func.apply(this, ...args);
      }
    };
}
