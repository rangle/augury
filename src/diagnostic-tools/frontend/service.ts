import { Injectable } from '@angular/core';

import { selectors } from './state.model';
import { DiagActions } from './actions';

@Injectable()
export class DiagService {

  public selectors;
  public actions;

  constructor(
    public diagActions: DiagActions,
  ) {
    this.selectors = selectors;
    this.actions = diagActions;
  }

}
