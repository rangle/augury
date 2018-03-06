
/**
 *  Diagnostics are serializable. (not enforced)
 */
export class Diagnostic {
  end: 'frontend' | 'backend';
  startTime: number;
  pass: boolean;
}

export type End = 'frontend' | 'backend';
