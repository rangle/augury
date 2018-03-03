// third party deps
import { Injectable } from '@angular/core';

// project deps
import { Options } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared';
import { Selectors } from './state.model';
import { DiagActions } from './actions';

@Injectable()
export class DiagService {

  constructor(
    public diagActions: DiagActions,
    public options: Options,
  ) { }

  clear = () =>
    this.diagActions.clear()

  takePacket = (packet: DiagPacket) =>
    this.diagActions.takePacket(packet)

}
