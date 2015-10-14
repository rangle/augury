import {Injectable} from 'angular2/angular2';
import * as Rx from 'rx';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType, UserActionType}
  from '../../actions/action-constants';
import {AbstractStore} from '../abstract-store';

@Injectable()
/**
 * Component Data Store
 */
export class ComponentDataStore extends AbstractStore {

  private _componentData;
  constructor(
    private dispatcher: Dispatcher
  ) {

    super();

    // Attach listeners to the dispatcher
    this.dispatcher.onAction(
      BackendActionType.COMPONENT_DATA_CHANGED,
      action => this.componentDataChanged(action.componentData));

    this.dispatcher.onAction(
      UserActionType.SELECT_NODE,
      action => this.selectNode(action));

    this.dispatcher.onAction(
      UserActionType.SEARCH_NODE,
      action => this.searchNode(action));
  }

  /**
   * Get component data
   */
  get componentData() {

    return this._componentData;

  }

  /**
   * Handle component data changed
   * @param  {Object} componentData
   */
  private componentDataChanged(componentData) {

    this._componentData = componentData;
    this.emitChange({ componentData });

  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node Node name
   */
  private selectNode({ node }) {

    this.emitChange({
      selectedNode: node,
      componentData: this._componentData
    });

  }

  /**
   * Search for a node
   * @param  {String} options.query
   */
  private searchNode({ query }) {

    if (query.length > 2) {
      this.emitChange({
        query: query,
        componentData: this._componentData
      });
    }

  }

}