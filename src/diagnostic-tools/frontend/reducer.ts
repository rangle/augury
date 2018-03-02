// same-module deps
import { DiagActions } from './actions';
import { updaters, NAMESPACE, INITIAL_STATE} from './state.model';

// this is the key name for the diag state subtree
export const basename = NAMESPACE;

export function diagReducer(state = INITIAL_STATE, action) {

  switch (action.type) {
    case DiagActions.LOGMSG:
      return { log: updaters.log.addMsg(action.payload, state) };
    case DiagActions.LOGPKT:
      return { log: updaters.log.addPkt(action.payload, state) };
    case DiagActions.CLEAR:
      return updaters.clear();
  }

  return state;
}
