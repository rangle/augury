// same-module deps
import {
  wrapAsDiagnosable,
  DiagHelpersPre,
  DiagHelpersPost
} from 'diagnostic-tools/shared';
import { DiagService } from './service';

// @todo: more functional way to do this?
let diagService: DiagService;
export const useServiceInstance = (s: DiagService) => diagService = s;

export function diagnosable({ pre, post }: {
  pre?: (d: DiagHelpersPre) => (...T) => void;
  post?: (d: DiagHelpersPost) => (...T) => void;
}) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {

      const func = descriptor.value;
      descriptor.value = function (...args) {
        const { result, error, diagPacket }
          = wrapAsDiagnosable('frontend', propertyKey, func, { pre, post }).apply(this, [...args]);
        diagService.takePacket(diagPacket);
        if (error) { throw error; }
        return result;
      };
      return descriptor;

    };
}
