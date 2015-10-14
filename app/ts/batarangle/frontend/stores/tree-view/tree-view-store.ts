import {Injectable} from 'angular2/angular2';
import * as Rx from 'rx';

import {Dispatcher} from '../../dispatcher/dispatcher';
import {ActionType} from '../../actions/action-constants';
import {ComponentTree} from '../../core/tree-view/tree-view-api';

import {AbstractStore} from '../abstract-store';

@Injectable()
export class TreeViewStore extends AbstractStore {

  constructor(
    private dispatcher: Dispatcher,
    private componentTree: ComponentTree) {
    
    super();
    
    this.dispatcher.onAction(
      ActionType.ROOT_FOUND, 
      action => this.getRoot());
  }

  getRoot() {
    this.emitChange(this.componentTree.componentTree.first());
  }
}