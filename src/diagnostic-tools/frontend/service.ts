// third party deps
import { Injectable } from '@angular/core';
import { select } from '@angular-redux/store';

// project deps
import { Connection, Options, Message } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket, Diagnostic, DiagnosticMessageFactory, diagnoseEvent } from 'diagnostic-tools/shared';
import { Selectors, Import, ACTIVE_TAB } from './state.model';
import { DiagActions } from './actions';
import { createFrontendDiagnosticsMessageHandler } from './messageHandler.function';

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

  @select(Selectors.imports) imports;

  private _messageHandler
    : (message: Message<any>, respond: () => void ) => void
    = createFrontendDiagnosticsMessageHandler(this);

  constructor(
    public diagActions: DiagActions,
    public options: Options,
    private connection: Connection,
  ) {}

  handleMessage(message: Message<any>, respond: () => void) {
    this._messageHandler(message, respond)
  }

  diagnoseEvent(eventName: string) {
    return (diagnoser: (serviceForDiagnoser: { //// TODO: move diagnoser definition somewhere (duplicate)
      assert: (label:string, expression:boolean, { fail }?) => boolean;
      say: (txt:string) => void;
      inspect: (serializable: any) => void;
    }) => void) => {
      debugger
      const packet = diagnoseEvent('frontend', eventName)(diagnoser)
      this.takePacket(packet)
    };
  }

  clear() {
    this.diagActions.clear()
  }

  clearImports() {
    this.diagActions.clearImports()
  }

  takePacket(packet: DiagPacket) {
    if (this.options.diagnosticToolsEnabled)
      this.diagActions.takePacket(packet)
  }

  setShowPassed(bool: boolean) {
    if (this.options.diagnosticToolsEnabled)
      this.diagActions.setShowPassed(bool)
  }

  importDiagnostic(parsedImport: Array<DiagPacket>) {
    this.diagActions.importDiagnostic(parsedImport);
  }

  setCurrentView(tab: string): Promise<boolean> {
    return Promise.resolve()
      .then(() =>
        this.imports.first().subscribe((imps: Array<Import>) =>
          this.diagActions.setCurrentView( imps.find(imp => imp.name === tab) ? tab : ACTIVE_TAB )));
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
