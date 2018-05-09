// same-module deps
import { Diagnostic, isValidDiagnostic } from './Diagnostic.class';
import { FunctionDiagnostic, isValidFunctionDiagnostic } from './FunctionDiagnostic.class';

export enum DiagType {
  FUNCTION
}

export const isValidDiagType = (dt: any):boolean => {
  return (
    dt === DiagType.FUNCTION
  );
}

export const isFunctionDiagType = (dt: DiagType) => {
  return dt === DiagType.FUNCTION
};

// ----

export class DiagPacket {
  type: DiagType;
  diagnostic: Diagnostic;
}

export const isValidDiagPacket = (dp: any): boolean => {
  return (
    typeof dp === 'object' &&
    typeof isValidDiagType(dp.type) &&
    ( isFunctionDiagType(dp.type) ?
        isValidFunctionDiagPacket(dp)
      : true)
  );
};

// ----

export class FunctionDiagPacket extends DiagPacket {
  public type = DiagType.FUNCTION;
  constructor(
    public diagnostic: FunctionDiagnostic
  ) { super(); }
}

export const isValidFunctionDiagPacket = (fdp: any): boolean => {
  return (
    typeof fdp === 'object' &&
    fdp.type === DiagType.FUNCTION &&
    isValidFunctionDiagnostic(fdp.diagnostic)
  );
};
