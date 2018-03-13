
/**
 *  Diagnostics are serializable. (not enforced)
 */
export class Diagnostic {
  end: End;
  startTime: number;
  pass: boolean;
  logicalThread: { stackLevel: number; id: number };
}

export type End = 'frontend' | 'backend';
