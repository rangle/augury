// third party deps
// @todo: weird issues with this module. importing build file against webpack's recommendations
const stringifier = require('stringifier/build/stringifier');
const stringify = stringifier({ indent: ' ' });

// same-module deps
import { Diagnostic, End, isValidDiagnostic } from './Diagnostic.class';
import { Statement, Plaintext, Assertion, isValidStatement } from './Statement.class';

/**
 *  a FunctionDiagnostic represents the diagnosis results
 *    for a single execution event of a diagnosable function.
 */
export class EventDiagnostic extends Diagnostic {
  header: string;
  statements: Array<Statement>;
  snapshots: { [name: string]: string }; // each snapshot is stringified
  diagError?: any;
  exception?: any;
}

export const isValidEventDiagnostic = (ed: any): boolean => {
  return (
    isValidDiagnostic(ed) &&
    typeof ed.header === 'string' &&
    typeof ed.timestamp === 'number' &&
    typeof ed.endTime === 'number' &&
    Array.isArray(ed.statements) &&
      ed.statements
        .every(isValidStatement) &&
    typeof ed.snapshots === 'object' &&
      Object.keys(ed.snapshots)
        .every(k => typeof ed.snapshots[k] === 'string')
  );
};

/**
 *  this exists to facilitate the correct creation of EventDiagnostics.
 *  after all the data has been supplied, the `finish()` method will return
 *    a serializable EventDiagnostic. at this point the EventDiagnosticConstructor
 *    instance can be thrown out.
 */
export class EventDiagnosticConstructor {

  private header = undefined;
  private end = undefined;
  private timestamp = undefined;
  private statements = [];
  private snapshots = {};
  private diagError = undefined;
  private exception = undefined;
  private pass = true;
  private logicalThread = undefined;

  finish = (): EventDiagnostic => ({
    end: this.end,
    header: this.header,
    timestamp: this.timestamp,
    snapshots: this.snapshots,
    statements: this.statements,
    exception: this.exception,
    diagError: this.diagError,
    pass: this.pass,
    logicalThread: this.logicalThread,
  })

  setEnd = (end: End) =>
    this.end = end
  setLogicalThread = (lt) =>
    this.logicalThread = lt
  setFail = () =>
    this.pass = false
  setHeader = (txt: string) =>
    this.header = txt
  setTime = (timestamp: number) =>
    this.timestamp = timestamp
  setException = e => {
    this.exception = e.toString();
    this.setFail(); }
  setDiagError = (error) => {
    this.diagError = error.toString();
    this.setFail(); }
  inspect = (vals) => Object.keys(vals)
    .forEach(k => this.snapshots[k] = stringify(vals[k]));
  addPlaintext = (txt: string) =>
    this.statements.push(new Plaintext(txt));
  addAssertion = (label: string, pass: boolean) => {
    this.statements.push(new Assertion(label, pass));
    if (!pass) { this.setFail(); } }

}
