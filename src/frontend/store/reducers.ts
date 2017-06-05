import {combineReducers} from 'redux';
import {mainReducer} from '../reducers/main-reducer';
import {IAppState} from './model';

export const rootReducer = combineReducers({
  main: mainReducer,
});
