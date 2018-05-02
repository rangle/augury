
/**
 *  Diagnostics are serializable. (not enforced)
 */
export class Diagnostic {
  end: End;
  startTime: number;
  pass: boolean;
  logicalThread: {
    stackTreePosition: Array<number>;
    id: number
  };
}

export type End = 'frontend' | 'backend';
