import { wrapFunction } from '../diagnoseFunction.function';

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
        const {result, diagPacket} = wrapFunction('frontend', propertyKey, func, { pre, post }).apply(this, [...args]);
        diagService.logPacket(diagPacket);
        return result;
      };
      return descriptor;

    };
}
