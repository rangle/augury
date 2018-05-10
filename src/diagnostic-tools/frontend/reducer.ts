// same-module deps
import { DiagPacket } from '../shared';
import { DiagActions, DiagActionType } from './actions';
import { DiagState, Updaters, NAMESPACE, INITIAL_STATE} from './state.model';

// this is the key name for the diag state subtree
export const diagStoreRoot = NAMESPACE;

export function diagReducer(
  state: DiagState = INITIAL_STATE,
  action: { type: DiagActionType, payload: any }
): DiagState {

  switch (action.type) {
    case DiagActionType.TAKE_PKT:
      return Updaters.addPacket(<DiagPacket> action.payload, state);
    case DiagActionType.CLEAR:
      return Updaters.clear();
    case DiagActionType.SHOW_PASSED:
      return Updaters.setShowPassed(action.payload, state);
    case DiagActionType.IMPORT:
      return Updaters.addImport(action.payload, state);
    case DiagActionType.DIAG_TAB:
      return Updaters.selectTab(action.payload, state);
  }

  return state;
}
