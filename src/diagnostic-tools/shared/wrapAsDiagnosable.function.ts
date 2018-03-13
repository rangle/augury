// third party deps
import * as clone from 'clone';
import Zone from 'zone.js/dist/zone';

// same-module deps
import { FunctionDiagnostic, FunctionDiagnosticConstructor } from './FunctionDiagnostic.class';
import { FunctionDiagPacket } from './DiagPacket.class';

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

export function wrapAsDiagnosable <TargetReturnType> (
  end: 'backend' | 'frontend',
  name: string,
  func: (...targetFuncParams) => TargetReturnType,
  diagFuncs: {
    pre?: (d: DiagHelpersPre) => (...targetFuncParams) => void,
    post?: (d: DiagHelpersPost) => (...targetFuncParams) => void
  } = {}
): (...targetFuncParams) => {
  diagPacket: FunctionDiagPacket,
  result: TargetReturnType,
  error: any,
} {

  return function (...args) {

    const funcDiagC = new FunctionDiagnosticConstructor();
    funcDiagC.setEnd(end);
    funcDiagC.setHeader(name);

    const mem = {};
    const serviceForSection = (section: 'pre'|'post') => {
      const sectionUtils = funcDiagC.getSectionMethods(section);
      return {
        assert: (label, expression, { fail } = { fail }) => {
          sectionUtils.addAssertion(label, !!expression);
          if (!expression && fail) { fail(); }
          return expression;
        },
        say: (txt: string) => sectionUtils.addPlaintext(txt),
        remember: section === 'pre' ?
          vals => Object.keys(vals).forEach(k => mem[k] = clone(vals[k]))
          : undefined,
        old: section === 'post' ?
          key => mem[key]
          : undefined,
        inspect: (serializable: {} = {}) => sectionUtils.inspect(serializable),
      };
    };

    if (diagFuncs.pre) {
      try { diagFuncs.pre(serviceForSection('pre')).apply(this, args); }
      catch (error) { funcDiagC.setDiagError({ section: 'pre', error }); }
    }

    const { result, error } = (() => {
      let retVal;
      funcDiagC.setStartTime(Date.now());
      if(Zone.current.thread)
      try { retVal = { result: func.apply(this, args), error: undefined }; }
      catch (error) { retVal = { error, result: undefined }; }
      funcDiagC.setEndTime(Date.now());
      return retVal;
    })();

    if (!error) {
      if (diagFuncs.post) {
        try { diagFuncs.post(serviceForSection('post')).apply(this, [ result ]); }
        catch (error) { funcDiagC.setDiagError({ section: 'post', error }); }
      }
    } else {
      funcDiagC.setException(error);
    }

    return { result, error, diagPacket: new FunctionDiagPacket(funcDiagC.finish()) };

  };

}
