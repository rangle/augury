
/**
 *  Diagnostics are serializable. (not enforced)
 */
export class Diagnostic {
  end: End
  startTime: number;
  pass: boolean;
}

export type End = 'frontend' | 'backend';
