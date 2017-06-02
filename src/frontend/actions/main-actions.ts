import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';
import {Tab, StateTab} from '../state';
import {IAppState} from '../store/model';

@Injectable()
export class MainActions {
  static readonly SELECT_TAB = 'SELECT_TAB';
  static readonly SELECT_COMPONENTS_SUB_TAB = 'SELECT_COMPONENTS_SUB_TAB';
  static readonly DOM_SELECTION_ACTIVE_CHANGE = 'DOM_SELECTION_ACTIVE_CHANGE';
  static readonly SEND_ANALYTICS = 'SEND_ANALYTICS';

  @dispatch()
  selectTab = (tab: Tab) => ({
    type: MainActions.SELECT_TAB,
    payload: tab,
  })

  @dispatch()
  selectComponentsSubTab = (tab: StateTab) => ({
    type: MainActions.SELECT_COMPONENTS_SUB_TAB,
    payload: tab,
  })

  @dispatch()
  setDOMSelectionActive = (state: boolean) => ({
    type: MainActions.DOM_SELECTION_ACTIVE_CHANGE,
    payload: state,
  })

  @dispatch()
  sendAnalytics = (event, desc) => ({
    type: MainActions.SEND_ANALYTICS,
    payload: {
      event,
      desc
    }
  })
}
