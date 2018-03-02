// third party deps
import * as clone from 'clone';

// same-module deps
import { DiagPacketConstructor } from './DiagPacket.class';

export function wrapAsDiagnosable(
  end: 'backend'|'frontend',
  name: string, func: Function,
  diagFuncs: {pre?: Function,  post?: Function} = {pre: undefined, post: undefined}
) {

  return function (...args) {

    const diagPacketC = new DiagPacketConstructor();
    diagPacketC.setEnd(end);
    diagPacketC.setHeader(name);

    const mem = {};
    const serviceForSection = (section: 'pre'|'post') => {
      const packetMethods = diagPacketC.getSectionMethods(section);
      return {
        assert: (label, expression, { fail } = { fail: undefined }) => {
          packetMethods.addAssertion(label, !!expression);
          if (!expression && fail) { fail(); }
          return expression;
        },
        text: (txt:string) => packetMethods.addPlaintext(txt),
        remember: section === 'pre' ?
          vals => Object.keys(vals).forEach(k => mem[k] = clone(vals[k]))
          : undefined,
        old: section === 'post' ?
          key => mem[key]
          : undefined,
        inspect: (serializable: {} = {}) => packetMethods.inspect(serializable),
      };
    };

    if (diagFuncs.pre) {
      try { diagFuncs.pre(serviceForSection('pre')).apply(this, args); }
      catch (error) { diagPacketC.setDiagError({ section: 'pre', error }); }
    }

    const { result, error } = (() => {
      let retVal;
      diagPacketC.setStartTime(Date.now());
      try { retVal = { result: func.apply(this, args), error: undefined }; }
      catch (error) { retVal = { error, result: undefined }; }
      diagPacketC.setEndTime(Date.now());
      return retVal;
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
