import { NodeInspectActions, NodeInspectActionType } from './actions'
import { NodeInspectState, NodeInspectUpdaters, NAMESPACE, INITIAL_STATE } from './state.model';

// this is the key name for the diag state subtree
export const nodeInspectStoreRoot = NAMESPACE;

export function nodeInspectReducer(
  state: NodeInspectState = INITIAL_STATE,
  action: { type: NodeInspectActionType, payload: any }
): NodeInspectState {

  switch (action.type) {

    case NodeInspectActionType.NI_GENERIC_UPDATE:
      const updater = action.payload.updater;
      return updater(state);

  }

  return state;
}
