import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';
import {Tab} from '../state/tab';
import {IAppState} from '../store/model';

@Injectable()
export class MainActions {
  static readonly SELECT_TAB = 'SELECT_TAB';

  @dispatch()
  selectTab = (tab: Tab) => ({
    type: MainActions.SELECT_TAB,
    payload: tab,
  })
}
