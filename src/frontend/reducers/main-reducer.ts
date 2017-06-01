import {MainActions} from '../actions/main-actions';
import {Tab} from '../state/tab';
import {IAppState, IAuguryState} from '../store/model';

const INITIAL_STATE: IAuguryState = {
  selectedTab: Tab.ComponentTree,
};

export function mainReducer(state: IAuguryState = INITIAL_STATE,
  action): IAuguryState {

  switch (action.type) {
    case MainActions.SELECT_TAB:
      state.selectedTab = action.payload;
      return state;
  }

  return state;
};
