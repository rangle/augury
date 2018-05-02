// project deps
import { send } from 'diagnostic-tools/module-dependencies.barrel';

// same-module depsw
import {
  isEnabled
} from 'diagnostic-tools/backend/settings.global';

import {
  DiagnosticMessageFactory,
  wrapAsDiagnosable,
  DiagHelpersPre,
  DiagHelpersPost
} from 'diagnostic-tools/shared';

export function diagnosable({ name, deps = [], pre, post, }: {
  name?: string;
  deps?: Array<string>;
  pre?: (d: DiagHelpersPre) => (...targetFuncParams) => void;
  post?: (d: DiagHelpersPost) => (targetReturnVal) => void;
}) {
  return function (target: (...targetFuncParams) => any) {
    const func = target;
      return function (...args) {
        if (!isEnabled()) return func.apply(this, [...args]) // TODO: make sure "this" works as expected in target func context
        const { result, error, diagPacket }
          = wrapAsDiagnosable('backend', name ? name : func.name, func, { pre, post }).apply(this, [...args]);
        send(DiagnosticMessageFactory.diagnosticPacket(diagPacket));
        if (error) { throw error; }
        return result;
      }
  };
}
