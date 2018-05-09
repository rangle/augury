
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

export const isValidDiagnostic = (d: any): boolean => {
  return (
    typeof d === 'object' &&
    [ 'frontend', 'backend' ].some(end => d.end === end) &&
    typeof d.startTime === 'number' &&
    typeof d.pass === 'boolean' &&
    typeof d.logicalThread === 'object' &&
    Array.isArray(d.logicalThread.stackTreePosition) &&
    typeof d.logicalThread.id === 'number'
  );
};
