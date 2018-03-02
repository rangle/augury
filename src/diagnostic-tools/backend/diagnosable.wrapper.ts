// project deps
import { send } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagnosticMessageFactory, wrapAsDiagnosable } from 'diagnostic-tools/shared';

interface DiagnosableParams { // @todo flush out types
    name?: string;
    deps?: Array<string>;
    pre?: Function;
    post?: Function;
}

export function diagnosable({
  pre = undefined, post = undefined,
  name = undefined , deps = [],
}: DiagnosableParams) {
    return function (target: any) {
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
