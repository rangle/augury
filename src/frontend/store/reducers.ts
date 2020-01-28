import { combineReducers } from 'redux';
import { mainReducer } from '../reducers/main-reducer';

export const rootReducer = combineReducers({
  main: mainReducer
});
