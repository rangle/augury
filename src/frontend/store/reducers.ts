import {combineReducers} from 'redux';
import {mainReducer} from '../reducers/main-reducer';
import {IAppState} from './model';
import { nodeInspectReducer, nodeInspectStoreRoot }  from 'feature-modules/node-inspect/frontend';

export const rootReducer = combineReducers({
  main: mainReducer,
  [nodeInspectStoreRoot]: nodeInspectReducer,
});
