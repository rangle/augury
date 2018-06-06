import { Injectable } from '@angular/core';
import { select } from '@angular-redux/store';

import {
  NodeInspectUpdaters as Updaters,
  NodeInspectSelectors as Selectors } from './state.model';
import {
  NodeInspectActions as Actions } from './actions';

@Injectable()
export class NodeInspectService {

  @select(Selectors.examples) examples;

  constructor(
    private _actions: Actions
  ) {}

  addExample() {
    this._actions.genericUpdate(Updaters.addExample())
  }

}
