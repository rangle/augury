import * as R from 'ramda';

import {DiagActions} from './actions';
import { updaters, NAMESPACE, INITIAL_STATE} from './state.model';

// this is the key name for the diag state subtree
export const basename = NAMESPACE;

export function diagReducer(state = INITIAL_STATE, action) {

  switch (action.type) {
    case DiagActions.LOG:
      return { log: updaters.log.add(action.payload, state) };
  }

  return state;
}
