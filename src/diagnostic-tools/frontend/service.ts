import { Injectable } from '@angular/core';

import { Options } from '../../frontend/state'; // @todo: pathing (should we merge with src/frontend?)

import { selectors } from './state.model';
import { DiagActions } from './actions';
import { DiagPacket } from '../DiagPacket.class';

@Injectable()
export class DiagService {

  public selectors;
  public actions;

  constructor(
    public diagActions: DiagActions,
    public options: Options,
  ) {
    this.selectors = selectors;
    this.actions = diagActions;

    this.log('diagnoticToolsEnabled? -> ' + options.diagnoticToolsEnabled);
  }

  clear = () => {
    this.actions.clear();
  }

  log = (txt: string) => {
    this.actions.logMsg({ txt });
  }

  assert(label, isTrue) {
    this.log(`[${Date.now()}] ${label}: ` + isTrue);
  }

  logPacket(packet: DiagPacket) {
    this.actions.logPacket(packet);
  }

  logMsg(msg: { txt: string }) {
    this.actions.logMsg(msg);
  }

}
