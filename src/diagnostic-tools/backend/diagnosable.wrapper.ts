// project deps
import { send } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagnosticMessageFactory, wrapAsDiagnosable, DiagHelpersPre, DiagHelpersPost} from 'diagnostic-tools/shared';

export function diagnosable({ name, deps = [], pre, post, }: {
  name?: string;
  deps?: Array<string>;
  pre?: (d: DiagHelpersPre) => (...T) => void;
  post?: (d: DiagHelpersPost) => (...T) => void;
}) {
  return function (target: (...T) => any) {
    const func = target;
    return function (...args) {
      const { result, error, diagPacket }
        = wrapAsDiagnosable('backend', name ? name : func.name, func, { pre, post }).apply(this, [...args]);
      send(DiagnosticMessageFactory.diagnosticPacket(diagPacket));
      if (error) { throw error; }
      return result;
    };
  };
}
