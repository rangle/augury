import {Injectable} from 'angular2/angular2';
import * as Rx from 'rx';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType} from '../../actions/action-constants';
import {AbstractStore} from '../abstract-store';

@Injectable()
export class ComponentDataStore extends AbstractStore {
  
  private _componentData;
  
  constructor(
    private dispatcher: Dispatcher) {
    
    super();
    
    this.dispatcher.onAction(
      BackendActionType.COMPONENT_DATA_CHANGED, 
      action => this.componentDataChanged(action.componentData));
  }

  private componentDataChanged(componentData) {
    this._componentData = componentData;
    this.emitChange(componentData);
    //this.emitChange(this.componentTree.componentTree.first());
  }
  
  get componentData() {
    return this._componentData;
  }
}