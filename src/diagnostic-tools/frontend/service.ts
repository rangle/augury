import { Injectable } from '@angular/core';

import { Options } from '../../frontend/state'; // @todo: pathing (should we merge with src/frontend?)

import { selectors } from './state.model';
import { DiagActions } from './actions';

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

    this.actions.log({ txt: 'diagnoticToolsEnabled? -> ' + options.diagnoticToolsEnabled });
  }

  // event hooks ----

  receivedTree(content) {

  }

}
