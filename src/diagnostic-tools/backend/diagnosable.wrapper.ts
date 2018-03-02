// project deps
import { send } from 'diagnostic-tools/module-dependencies.barrel';

import { DiagnosticMessageFactory } from 'diagnostic-tools/shared/communication/message-factory';

// same-module deps
import { DiagPacketConstructor } from 'diagnostic-tools/shared/DiagPacket.class';
import { wrapAsDiagnosable } from 'diagnostic-tools/shared/wrapAsDiagnosable.function';

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


export function diagnosableEvent(name) {
  send(DiagnosticMessageFactory.diagnosticMsg({
    txt: `-------\n[backend] [${Date.now()}] event occurred: ${name}`
  }));
}
