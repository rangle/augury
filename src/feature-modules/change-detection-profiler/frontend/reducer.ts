import { ChangeDetectionProfilerActions, ChangeDetectionProfilerActionType } from './actions'
import { ChangeDetectionProfilerState, ChangeDetectionProfilerUpdaters, NAMESPACE, INITIAL_STATE } from './state.model';

// this is the key name for the diag state subtree
export const changeDetectionProfilerStoreRoot = NAMESPACE;

export function changeDetectionProfilerReducer(
  state: ChangeDetectionProfilerState = INITIAL_STATE,
  action: { type: ChangeDetectionProfilerActionType, payload: any }
): ChangeDetectionProfilerState {

  switch (action.type) {

    case ChangeDetectionProfilerActionType.CDP_GENERIC_UPDATE:
      const updater = action.payload.updater;
      return updater(state);

  }

  return state;
}
