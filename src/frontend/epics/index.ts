import {combineEpics} from 'redux-observable';

import {
  domSelectionGtmEpic,
  tabChangeGtmEpic,
  subTabChangeGtmEpic,
  emitValueGtmEpic,
  updatePropertyGtmEpic,
  initializeAuguryGtmEpic
} from './gtm';

export const rootEpic = combineEpics(
  domSelectionGtmEpic,
  tabChangeGtmEpic,
  subTabChangeGtmEpic,
  emitValueGtmEpic,
  updatePropertyGtmEpic,
  initializeAuguryGtmEpic
);
