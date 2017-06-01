import {combineReducers} from 'redux';
import {mainReducer} from '../reducers/main-reducer';
import {IAppState} from './model';

// Define the global store shape by combining our application's
// reducers together into a given structure.
export const rootReducer = combineReducers({
  main: mainReducer,
});
