import { Injectable } from '@angular/core';

import { selectors } from './state.model';
import { DiagActions } from './actions';

@Injectable()
export class DiagService {

  public selectors = selectors;
  public actions = DiagActions;

}
