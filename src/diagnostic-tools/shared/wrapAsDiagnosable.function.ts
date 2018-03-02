// @todo: change name of file to wrapFunction

import * as clone from 'clone';

import { DiagPacketConstructor } from './DiagPacket.class';

declare const Zone: any;

export function wrapAsDiagnosable(
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
        assert: (label, expression, { fail } = { fail: undefined }) => {
          packetMethods.msg({
            txt: `[${Date.now()}] ${label}: [${!!expression}]`,
            color: expression ? 'default' : 'error',
          });
          if (!expression && fail) { fail(); }
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
      let retVal;
      if (!Zone.current.auguryDiagnostic) {
          Zone.current.auguryDiagnostic = { stackLevel: 0 };
      }
      console.log('executing: ', name ? name : func.name);
      console.log('current stack level: ', Zone.current.auguryDiagnostic.stackLevel);
      Zone.current.auguryDiagnostic.stackLevel++;
      try { retVal = { result: func.apply(this, args), error: undefined }; }
      catch (error) { retVal = { error, result: undefined }; }
      Zone.current.auguryDiagnostic.stackLevel--;
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
