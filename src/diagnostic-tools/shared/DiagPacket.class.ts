// same-module deps
import { Diagnostic } from './Diagnostic.class';
import { FunctionDiagnostic } from './FunctionDiagnostic.class';

export enum DiagType {
  FUNCTION
}

export class DiagPacket {
  type: DiagType;
  diagnostic: Diagnostic;
}

export class FunctionDiagPacket extends DiagPacket {
  public type = DiagType.FUNCTION;
  constructor(
    public diagnostic: FunctionDiagnostic
  ) { super(); }
}
