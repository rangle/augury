import { assoc } from 'ramda';

import {MainActions} from '../actions/main-actions';
import {StateTab, Tab} from '../state/tab';
import {IAppState, IAuguryState} from '../store/model';

const INITIAL_STATE: IAuguryState = {
  selectedTab: Tab.ComponentTree,
  selectedComponentsSubTab: StateTab.Properties,
  DOMSelectionActive: false,
};

export function mainReducer(state: IAuguryState = INITIAL_STATE,
  action): IAuguryState {

  switch (action.type) {
    case MainActions.SELECT_TAB:
      return assoc('selectedTab', action.payload, state);
  }

  switch (action.type) {
    case MainActions.SELECT_COMPONENTS_SUB_TAB:
      return assoc('selectedComponentsSubTab', action.payload, state);
  }

  switch (action.type) {
    case MainActions.DOM_SELECTION_ACTIVE_CHANGE:
      return assoc('DOMSelectionActive', action.payload, state);
  }

  return state;
}
