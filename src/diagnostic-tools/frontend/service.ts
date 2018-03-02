// third party deps
import { Injectable } from '@angular/core';

// project deps
import { Options } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared/DiagPacket.class';
import { selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';


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
