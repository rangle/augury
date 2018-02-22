import * as clone from 'clone';

import { DiagPacketConstructor } from './DiagPacket.class';

export function wrapFunction(
  end: 'backend'|'frontend',
  name: string, func: Function,
    { pre = undefined, post = undefined }
  = { pre: undefined,  post: undefined  }
) {

  return function (...args) {

    const diagPacketC = new DiagPacketConstructor();
    diagPacketC.setHeader(`-------\n[${end}] [${Date.now()}] executing method: ${name}`);

    const mem = {};
    const serviceForSection = (section: 'pre'|'post') => {
      const packetMethods = diagPacketC.getSectionMethods(section);
      return {
        assert: (label, expression) => {
          packetMethods.msg({
            txt: `[${Date.now()}] ${label}: [${!!expression}]`,
            color: expression ? 'default' : 'error',
          });
          return expression;
        },
        remember: section === 'pre' ?
          vals => Object.keys(vals).forEach(k => mem[k] = clone(vals[k]))
          : undefined,
        old: section === 'post' ?
          key => mem[key]
          : undefined,
        inspect: packetMethods.inspect,
      };
    };

    if (pre) { pre(serviceForSection('pre')).apply(this, args); }
    const result = func.apply(this, args);
    if (post) { post(serviceForSection('post')).apply(this, [ result, ...args ]); }

    return { result, diagPacket: diagPacketC.finish() };

  };

}
