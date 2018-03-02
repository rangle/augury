// same-module deps
import { wrapAsDiagnosable } from 'diagnostic-tools/shared/wrapAsDiagnosable.function';

let diagService;

export function useServiceInstance(s) {
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
        const { result, error, diagPacket }
          = wrapAsDiagnosable('frontend', propertyKey, func, { pre, post }).apply(this, [...args]);
        diagService.logPacket(diagPacket);
        if (error) { throw error; }
        return result;
      };
      return descriptor;

    };
}
