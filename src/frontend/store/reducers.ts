import {combineReducers} from 'redux';

import { mainReducer } from '../reducers/main-reducer';
import { diagReducer, basename } from 'diagnostic-tools/frontend/reducer';

export const rootReducer = combineReducers({
  main: mainReducer,
  [basename]: diagReducer
});
