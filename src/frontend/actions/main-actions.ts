import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';
import {Tab, StateTab} from '../state';
import {IAppState} from '../store/model';
import {Path} from '../../tree';

@Injectable()
export class MainActions {
  static readonly SELECT_TAB = 'SELECT_TAB';
  static readonly SELECT_COMPONENTS_SUB_TAB = 'SELECT_COMPONENTS_SUB_TAB';
  static readonly DOM_SELECTION_ACTIVE_CHANGE = 'DOM_SELECTION_ACTIVE_CHANGE';
  static readonly SEND_ANALYTICS = 'SEND_ANALYTICS';
  static readonly EMIT_VALUE = 'EMIT_VALUE';
  static readonly UPDATE_PROPERTY = 'UPDATE_PROPERTY';
  static readonly INITIALIZE_AUGURY = 'INITIALIZE_AUGURY';

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
  emitValue = (path: Path, data: any) => ({
    type: MainActions.EMIT_VALUE,
    payload: {
      path,
      data
    }
  })

  @dispatch()
  updateProperty = (path: Path, data: any) => ({
    type: MainActions.UPDATE_PROPERTY,
    payload: {
      path,
      data
    }
  })

  @dispatch()
  initializeAugury = () => ({
    type: MainActions.INITIALIZE_AUGURY,
  })

  @dispatch()
  sendAnalytics = (event: string, desc: string) => ({
    type: MainActions.SEND_ANALYTICS,
    payload: {
      event,
      desc
    }
  })

}
