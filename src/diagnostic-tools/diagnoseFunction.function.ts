import * as clone from 'clone';

import { DiagPacketConstructor } from './DiagPacket.class';

export function wrapFunction(
  end: 'backend'|'frontend',
  name: string, func: Function,
  diagFuncs: {pre?: Function,  post?: Function} = {pre: undefined, post: undefined}
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

    if (diagFuncs.pre) {
      try { diagFuncs.pre(serviceForSection('pre')).apply(this, args); }
      catch (error) { diagPacketC.setDiagError({ section: 'pre', error }); }
    }

    const { result, error } = (() => {
      try { return { result: func.apply(this, args), error: undefined }; }
      catch (error) { return { error, result: undefined }; }
    })();

    if (!error) {
      if (diagFuncs.post) {
        try { diagFuncs.post(serviceForSection('post')).apply(this, [ result ]); }
        catch (error) { diagPacketC.setDiagError({ section: 'post', error }); }
      }
    } else {
      diagPacketC.setException(error);
    }

    return { result, error, diagPacket: diagPacketC.finish() };

  };

}
