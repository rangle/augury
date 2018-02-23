import { send } from '../../backend/indirect-connection'; // @todo: pathing
import { MessageFactory } from '../../communication/message-factory';

import { DiagPacketConstructor } from '../DiagPacket.class';
import { wrapFunction } from '../diagnoseFunction.function';

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
          = wrapFunction('backend', name ? name : func.name, func, { pre, post }).apply(this, [...args]);
        send(MessageFactory.diagnosticPacket(diagPacket));
        if (error) { throw error; }
        return result;
      };
    };
}


export function diagnosableEvent(name) {
  send(MessageFactory.diagnosticMsg({
    txt: `-------\n[backend] [${Date.now()}] event occurred: ${name}`
  }));
}
