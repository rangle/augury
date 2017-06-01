import { Tab } from '../state/tab';

export interface IAppState {
  main: IAuguryState;
}

export interface IAuguryState {
  selectedTab: Tab;
}
