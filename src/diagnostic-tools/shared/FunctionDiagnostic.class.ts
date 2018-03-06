// third party deps
// @todo: weird issues with this module. importing build file against webpack's recommendations
const stringifier = require('stringifier/build/stringifier');
const stringify = stringifier({ indent: ' ' });

// same-module deps
import { Diagnostic } from './Diagnostic.class';

/**
 *  a FunctionDiagnostic represents the diagnosis results
 *    for a single execution event of a diagnosable function.
 */
export class FunctionDiagnostic extends Diagnostic {
  end: 'frontend' | 'backend';
  header: string;
  startTime: number;
  endTime: number;
  pre?: SectionResult;
  post?: SectionResult;
  diagError?: { section, error };
  exception?: any;
}

/**
 *  SectionResults contain arrays of statements of the following types.
 *    full type definitions below (Statement, Assertion, Plaintext, ..).
 */
export enum STATEMENT_TYPE {
    ASSERTION,
    PLAIN_TEXT
}

/**
 *  a diagnostic section represents the result of the execution of a section of diagnostic code.
 *    sections like 'pre' and 'post' execute before and after the target function respectively.
 */
class SectionResult {
  statements: Array<Statement>;
  snapshots: { [name: string]: string }; // each snapshot is stringified
}

/**
 */
abstract class Statement {
  type: STATEMENT_TYPE;
}

/**
 */
class Assertion extends Statement {
  type = STATEMENT_TYPE.ASSERTION;
  constructor(
    public label: string,
    public pass: boolean
  ) { super(); }
}

/**
 */
class Plaintext extends Statement {
  type = STATEMENT_TYPE.PLAIN_TEXT;
  constructor(
    public text: string
  ) { super(); }
}

/**
 *  this exists to facilitate the correct creation of FunctionDiagnostics.
 *  after all the data has been supplied, the `finish()` method will return
 *    a serializable DiagPacket. at this point the DiagPacketConstructor
 *    instance can be thrown out.
 */
export class FunctionDiagnosticConstructor extends FunctionDiagnostic {

  finish = (): FunctionDiagnostic => ({
    end: this.end,
    header: this.header,
    startTime: this.startTime,
    endTime: this.endTime,
    pre: this.pre,
    post: this.post,
    exception: this.exception,
    diagError: this.diagError,
    pass: this.pass
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

  setFail = () =>
    this.pass = false
  setHeader = (txt: string) =>
    this.header = txt
  setEnd = (end: 'frontend' | 'backend') =>
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
