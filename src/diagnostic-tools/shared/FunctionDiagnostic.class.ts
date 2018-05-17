// third party deps
// @todo: weird issues with this module. importing build file against webpack's recommendations
const stringifier = require('stringifier/build/stringifier');
const stringify = stringifier({ indent: ' ' });

// same-module deps
import { Diagnostic, End, isValidDiagnostic } from './Diagnostic.class';
import { Statement, Plaintext, Assertion } from './Statement.class';

/**
 *  a FunctionDiagnostic represents the diagnosis results
 *    for a single execution event of a diagnosable function.
 */
export class FunctionDiagnostic extends Diagnostic {
  header: string;
  startTime: number;
  endTime: number;
  pre?: SectionResult;
  post?: SectionResult;
  diagError?: { section, error };
  exception?: any;
}

export const isValidFunctionDiagnostic = (fd: any): boolean => {
  return (
    isValidDiagnostic(fd) &&
    typeof fd.header === 'string' &&
    typeof fd.startTime === 'number' &&
    typeof fd.endTime === 'number' &&
    ( fd.pre ? isValidSectionResult(fd.pre) : true ) &&
    ( fd.post ? isValidSectionResult(fd.post) : true )
  );
};

/**
 *  a diagnostic section represents the result of the execution of a section of diagnostic code.
 *    sections like 'pre' and 'post' execute before and after the target function respectively.
 */
class SectionResult {
  statements: Array<Statement>;
  snapshots: { [name: string]: string }; // each snapshot is stringified
}

const isValidSectionResult = (sr: any): boolean => {
  return (
    typeof sr === 'object' &&
    Array.isArray(sr.statements) &&
    typeof sr.snapshots === 'object'
  );
};

/**
 *  this exists to facilitate the correct creation of FunctionDiagnostics.
 *  after all the data has been supplied, the `finish()` method will return
 *    a serializable FunctionDiagnostic. At this point the FunctionDiagnosticConstructor
 *    instance can be thrown out.
 */
export class FunctionDiagnosticConstructor extends FunctionDiagnostic {

  finish = (): FunctionDiagnostic => ({
    end: this.end,
    header: this.header,
    startTime: this.startTime,
    endTime: this.endTime,
    timestamp: this.startTime,
    pre: this.pre,
    post: this.post,
    exception: this.exception,
    diagError: this.diagError,
    pass: this.pass,
    logicalThread: this.logicalThread,
  })

  constructor() {
    super();
    this.header = '';
    this.pre =  { statements: [], snapshots: {}, };
    this.post = { statements: [], snapshots: {}, };
    this.diagError = undefined;
    this.exception = undefined;
    this.pass = true;
  }

  setLogicalThread = (lt) =>  // @todo: types and cleanup
    this.logicalThread = lt
  setFail = () =>
    this.pass = false
  setHeader = (txt: string) =>
    this.header = txt
  setEnd = (end: End) =>
    this.end = end
  setStartTime = (timestamp: number) =>
    this.startTime = timestamp
  setEndTime = (timestamp: number) =>
    this.endTime = timestamp
  setException = e => {
    this.exception = e.toString();
    this.setFail(); }
  setDiagError = ({ section, error }) => {
    this.diagError = { section, error: error.toString() };
    this.setFail(); }

  getSectionMethods = (section: 'pre'|'post') => ({
    inspect: (vals) => Object.keys(vals)
      .forEach(k => this[section].snapshots[k] = stringify(vals[k])),
    addPlaintext: (txt: string) =>
      this[section].statements.push(new Plaintext(txt)),
    addAssertion: (label: string, pass: boolean) => {
      this[section].statements.push(new Assertion(label, pass));
      if (!pass) { this.setFail(); } },
  })

}
