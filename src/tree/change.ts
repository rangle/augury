export type Operation = 'add'
  | 'copy'
  | 'replace'
  | 'move'
  | 'remove'
  | 'test';

export interface Change {
  /// The operation that this change represents (add, remove, etc)
  op: Operation;

  /// The path to the element in the document being changed
  path: string;

  /// Right operand (value)
  value;
}