// third party deps
import * as clone from 'clone';

// same-module deps
import { DiagPacketConstructor, DiagPacket } from './DiagPacket.class';

interface DiagHelpersGeneral {
  say: (txt: string) => void;
  assert: (label: string, expression: boolean, ops?: { fail: () => void }) => boolean; // returns expression
  inspect: (serializable: any) => void;
}

export interface DiagHelpersPre extends DiagHelpersGeneral {
  remember: (things: { [name: string]: any }) => void;
}

export interface DiagHelpersPost extends DiagHelpersGeneral {
  old: (name: string) => any;
}

export function wrapAsDiagnosable(
  end: 'backend' | 'frontend',
  name: string,
  func: (...T) => any,
  diagFuncs: {
    pre?: (d: DiagHelpersPre) => (...T) => void,
    post?: (d: DiagHelpersPost) => (...T) => void
  } = {}
): (...T) => {
  diagPacket: DiagPacket,
  result: any,
  error: any,
} {

  return function (...args) {

    const diagPacketC = new DiagPacketConstructor();
    diagPacketC.setEnd(end);
    diagPacketC.setHeader(name);

    const mem = {};
    const serviceForSection = (section: 'pre'|'post') => {
      const packetMethods = diagPacketC.getSectionMethods(section);
      return {
        assert: (label, expression, { fail } = { fail }) => {
          packetMethods.addAssertion(label, !!expression);
          if (!expression && fail) { fail(); }
          return expression;
        },
        say: (txt: string) => packetMethods.addPlaintext(txt),
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
