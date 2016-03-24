import {Injectable} from 'angular2/core';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType} from '../action-constants';

@Injectable()
/**
 * Backend Actions
 */
export class BackendActions {

  constructor(
    private dispatcher: Dispatcher
  ) {
  }

  /**
   * Component Data Changed
   * Fired from the backend signals when the component tree has changed.
   * @param  {Array} componentData
   */
  componentTreeChanged(componentData) {
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.COMPONENT_TREE_CHANGED,
      componentData: componentData
    });
  }

  clearSelections() {
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.CLEAR_SELECTIONS
    });
  }

  renderRouterTree(tree) {
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.RENDER_ROUTER_TREE,
      tree: tree
    });
  }
}
