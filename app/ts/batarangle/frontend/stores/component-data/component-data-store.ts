import {Injectable} from 'angular2/angular2';
import * as Rx from 'rx';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType, UserActionType}
  from '../../actions/action-constants';
import {AbstractStore} from '../abstract-store';

interface Node { node: Object; }
interface Query { query: string; }

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
  private componentDataChanged(componentData: Array<Object>) {

    this._componentData = componentData;
    this.emitChange({ componentData });

  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node Node name
   */
  private selectNode({ node }: Node) {

      this.emitChange({
        selectedNode: node,
        componentData: this._componentData
      });

  }

  /**
   * [fuzzyFindNode description]
   * @param  {String} query [description]
   * @param  {Boolean} fuzzy [description]
   * @return {Function}
   */
  private findNodeBuilder(query: string, fuzzy: boolean) {

    if (fuzzy) {
      return node => node.name &&
      node.name.toLocaleLowerCase().includes(query);
    } else {
      return node => node.name &&
        new RegExp('^' + query + '$').test(node.name.toLocaleLowerCase());
    }

  }

  /**
   * Copy the an object while stripping
   * out the children list
   * @param  {Object} p
   * @return {Object}
   */
  private copyParent(p: Object) {

    return Object.assign({}, p, { children: undefined });

  }

  /**
   * Flatten a deeply nested list
   * @param  {Array} list
   * @return {Array}
   */
  private flatten(list: Array<any>) {

    return list.reduce((a, b) => {
      return a.concat(Array.isArray(b.children) ?
        [this.copyParent(b), ...this.flatten(b.children)] : b);
    }, []);

  }

  /**
   * Search for a node
   * @param  {String} options.query
   */
  private searchNode({ query }: Query) {

    const findNode = this.findNodeBuilder(query, false)
    const fuzzyFindNode = this.findNodeBuilder(query, true);
    const flattenedData = this.flatten(this._componentData);

    const node = flattenedData.find(findNode) ||
      flattenedData.find(fuzzyFindNode);

    if (node) {
      this.selectNode({ node });
    }

  }

}