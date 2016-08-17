export enum ChangeType {
  Insert,
  Remove,
  Update,
}

export interface Change {
  type: ChangeType;
}