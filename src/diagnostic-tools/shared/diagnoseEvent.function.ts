// third party deps
import * as clone from 'clone';
import { EventDiagnostic, EventDiagnosticConstructor } from './EventDiagnostic.class';
import { EventDiagPacket } from './DiagPacket.class';

declare const Zone:any; //@todo: check if not there, and import. angular may actually run without this

export function diagnoseEvent(
  end: 'backend' | 'frontend',
  name: string,
) {

  return (diagnoser: (serviceForDiagnoser: {
    assert: (label:string, expression:boolean, { fail }?) => boolean;
    say: (txt:string) => void;
    inspect: (serializable: any) => void;
  }) => void) => {

    const eventDiagC = new EventDiagnosticConstructor();
    eventDiagC.setEnd(end);
    eventDiagC.setHeader(name);

    const serviceForDiagnoser = {

      exception: (e:Error) => eventDiagC.setException(e),

      assert: (label, expression, { fail } = { fail: undefined }) => {
        eventDiagC.addAssertion(label, !!expression);
        if (!expression && fail) { fail(); }
        return expression;
      },

      say: (txt: string) => eventDiagC.addPlaintext(txt),

      inspect: (serializable: {} = {}) => eventDiagC.inspect(serializable),

    };

    // debugger;
    // @todo: all the zone operations should be part of a modular service.
    if (!Zone.current.auguryLogicalThread) {
        Zone.current.auguryLogicalThread = { // @todo: this is LogicalThread type
          id: Date.now(),
          stackTreePosition: [ 0 ]
        };
    }
    const logicalThread = Zone.current.auguryLogicalThread;

    eventDiagC.setLogicalThread(clone(logicalThread)); // @todo: logicalThread class should spit out clone thing

    eventDiagC.setTime(Date.now());

    try { diagnoser(serviceForDiagnoser); }
    catch (error) { eventDiagC.setDiagError(error); }

    // @todo: logicalThread class should handle cursor movement
    const nextSibling = logicalThread.stackTreePosition.pop() + 1;
    logicalThread.stackTreePosition.push( nextSibling );

    return new EventDiagPacket(eventDiagC.finish())

  };

}
