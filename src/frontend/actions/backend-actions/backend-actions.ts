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
  ) { }

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

  /**
   * Fired to the backend to clear the rollover selection for the Component. 
   */
  clearSelections() {
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.CLEAR_SELECTIONS
    });
  }

  /**
   * Fired from the backend signals to render the router tree.
   * @param  {Array} tree
   */
  renderRouterTree(tree) {
    this.dispatcher.messageBus.next({
      actionType: BackendActionType.RENDER_ROUTER_TREE,
      tree: tree
    });
  }
}
