import {combineEpics} from 'redux-observable';

import {
  domSelectionGtmEpic,
  tabChangeGtmEpic,
  subTabChangeGtmEpic,
} from './gtm';

export const rootEpic = combineEpics(
  domSelectionGtmEpic,
  tabChangeGtmEpic,
  subTabChangeGtmEpic,
);
