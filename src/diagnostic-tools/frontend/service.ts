// third party deps
import { Injectable } from '@angular/core';

// project deps
import { Options } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket, Diagnostic } from 'diagnostic-tools/shared';
import { Selectors } from './state.model';
import { DiagActions } from './actions';

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
  ) { }

  /* actions */

  @ifEnabled
  clear() {
    this.diagActions.clear()
  }

  @ifEnabled
  takePacket(packet: DiagPacket) {
    this.diagActions.takePacket(packet)
  }

  @ifEnabled
  setShowPassed(bool: boolean) {
    this.diagActions.setShowPassed(bool)
  }

}
