import {combineEpics} from 'redux-observable';

import { gtmEpic } from './gtm';

export const rootEpic = combineEpics(
  gtmEpic,
);
