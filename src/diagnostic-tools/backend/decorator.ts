import { send } from '../../backend/indirect-connection'; // @todo: pathing
import { MessageFactory } from '../../communication/message-factory';
import * as clone from 'clone';

export function diagnosable(
    { pre = undefined, post = undefined }
  = { pre: undefined,  post: undefined  }
) {
    return function (target: any) {
      const func = target;
      return function (...args) {
        send(MessageFactory.diagnosticPacket({
          txt: `-------\n[backend] [${Date.now()}] executing method: ${target.name}`
        }));
        const pseudoService = {
          assert: (label, expression) =>
            send(MessageFactory.diagnosticPacket({ txt: `[backend] [${Date.now()}] ${label}: ${expression}` }))
        };
        const mem = {};
        const remember = (vals) => Object.keys(vals).forEach(k => mem[k] = clone(vals[k]));
        const old = (key) => mem[key];

        if (pre) { pre(pseudoService, remember).apply(this, args); }
        const result = func.apply(this, args);
        if (post) { post(pseudoService, old).apply(this, [ result, ...args ]); }
        return result;
      };
    };
}
