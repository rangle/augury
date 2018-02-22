import { send } from '../../backend/indirect-connection'; // @todo: pathing
import { MessageFactory } from '../../communication/message-factory';

import { DiagPacketConstructor } from '../DiagPacket.class';
import { wrapFunction } from '../diagnoseFunction.function';

export function diagnosable(
    { pre = undefined, post = undefined }
  = { pre: undefined,  post: undefined  }
) {
    return function (target: any) {
      const func = target;
      return function (...args) {
        const {result, diagPacket} = wrapFunction('backend', func.name, func, { pre, post }).apply(this, [...args]);
        send(MessageFactory.diagnosticPacket(diagPacket));
        return result;
      };
    };
}


export function diagnosableEvent(name) {
  const diagPacketC = new DiagPacketConstructor();
  diagPacketC.setHeader(`-------\n[backend] [${Date.now()}] event occurred: ${name}`);
  send(MessageFactory.diagnosticPacket(diagPacketC.finish()));
}
