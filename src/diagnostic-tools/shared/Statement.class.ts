/**
 *  SectionResults contain arrays of statements of the following types.
 *    full type definitions below (Statement, Assertion, Plaintext, ..).
 */
export enum STATEMENT_TYPE {
    ASSERTION,
    PLAIN_TEXT
}

/**
 */
export abstract class Statement {
  type: STATEMENT_TYPE;
}

/**
 */
export const isValidStatement = (s: any):boolean => {
  return (
    typeof s === 'object' &&
    [ STATEMENT_TYPE.ASSERTION, STATEMENT_TYPE.PLAIN_TEXT ].includes(s.type) &&
    s.type === STATEMENT_TYPE.ASSERTION ?
      isValidAssertionStatement(s)
    : isValidPlaintextStatement(s)
  );
};

// ----

/**
 */
export class Assertion extends Statement {
  type = STATEMENT_TYPE.ASSERTION;
  constructor(
    public label: string,
    public pass: boolean
  ) { super(); }
}

/**
 */
export const isValidAssertionStatement = (s: any):boolean => {
  return (
    typeof s === 'object' &&
    s.type === STATEMENT_TYPE.ASSERTION &&
    typeof s.label === 'string' &&
    typeof s.pass === 'boolean'
  );
};

// ----

/**
 */
export class Plaintext extends Statement {
  type = STATEMENT_TYPE.PLAIN_TEXT;
  constructor(
    public text: string
  ) { super(); }
}

/**
 */
export const isValidPlaintextStatement = (s: any):boolean => {
  return (
    typeof s === 'object' &&
    s.type === STATEMENT_TYPE.PLAIN_TEXT &&
    typeof s.text === 'string'
  );
};
