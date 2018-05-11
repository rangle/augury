// third party deps
import { Injectable } from '@angular/core';

// project deps
import { Connection, Options } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket, Diagnostic, DiagnosticMessageFactory } from 'diagnostic-tools/shared';
import { Selectors } from './state.model';
import { DiagActions } from './actions';


// @todo: using this?
const ifEnabled = function (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const func = descriptor.value;
  descriptor.value = (...args) => {
    if (target.options.diagnosticToolsEnabled)
      return func(...args); }
  return descriptor;
}

@Injectable()
export class DiagService {

  constructor(
    public diagActions: DiagActions,
    public options: Options,
    private connection: Connection,
  ) { }

  /* actions */

  clear() {
    this.diagActions.clear()
  }

  takePacket(packet: DiagPacket) {
    if (this.options.diagnosticToolsEnabled)
      this.diagActions.takePacket(packet)
  }

  setShowPassed(bool: boolean) {
    if (this.options.diagnosticToolsEnabled)
      this.diagActions.setShowPassed(bool)
  }

  enabled(): boolean {
    return this.options.diagnosticToolsEnabled;
  }

  // deprecated, use enabled()
  diagEnabled():boolean {
    return this.enabled();
  }

  enable(): void {
    this.clear()
    this.options.diagnosticToolsEnabled = true;
    this._notifyBackendOfOptionsUpdate()
  }

  disable(): void {
    this.clear()
    this.options.diagnosticToolsEnabled = false;
    this._notifyBackendOfOptionsUpdate()
  }

  import(packets: Array<DiagPacket>) {
    return this.diagActions.importDiagnostic(packets)
  }

  private _notifyBackendOfOptionsUpdate(): void {
    this.connection.send(
      DiagnosticMessageFactory.diagnosticOptionsUpdated({
        diagnosticToolsEnabled: this.options.diagnosticToolsEnabled
      }))
  }

}
