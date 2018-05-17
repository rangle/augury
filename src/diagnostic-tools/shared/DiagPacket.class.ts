// same-module deps
import { Diagnostic, isValidDiagnostic } from './Diagnostic.class';
import { FunctionDiagnostic, isValidFunctionDiagnostic } from './FunctionDiagnostic.class';
import { EventDiagnostic, isValidEventDiagnostic } from './EventDiagnostic.class';

export enum DiagType {
  FUNCTION,
  EVENT,
}

export const isValidDiagType = (dt: any):boolean => {
  return (
    [ DiagType.FUNCTION, DiagType.EVENT ].includes(dt)
  );
}

export const isFunctionDiagType = (dt: DiagType) => {
  return dt === DiagType.FUNCTION
};

export const isEventDiagType = (dt: DiagType) => {
  return dt === DiagType.EVENT
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
    ( isFunctionDiagType(dp.type)
        ? isValidFunctionDiagPacket(dp)
        : isEventDiagType(dp.type)
          ? isValidEventDiagPacket(dp)
          : false )
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

// ----

export class EventDiagPacket extends DiagPacket {
  public type = DiagType.EVENT;
  constructor(
    public diagnostic: EventDiagnostic
  ) { super(); }
}

export const isValidEventDiagPacket = (edp: any): boolean => {
  return (
    typeof edp === 'object' &&
    edp.type === DiagType.EVENT &&
    isValidEventDiagnostic(edp.diagnostic)
  );
};

// ----
