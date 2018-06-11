import {combineReducers} from 'redux';
import {mainReducer} from '../reducers/main-reducer';
import {IAppState} from './model';
import { nodeInspectReducer, nodeInspectStoreRoot }  from 'feature-modules/node-inspect/frontend';
import { changeDetectionProfilerReducer, changeDetectionProfilerStoreRoot }  from 'feature-modules/change-detection-profiler/frontend';

export const rootReducer = combineReducers({
  main: mainReducer,
  [nodeInspectStoreRoot]: nodeInspectReducer,
  [changeDetectionProfilerStoreRoot]: changeDetectionProfilerReducer,
});
