import {Injectable} from 'angular2/core';
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
      BackendActionType.COMPONENT_TREE_CHANGED,
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
    this.emitChange({
      componentData,
      action: 'TREE_CHANGED'
    });

  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node Node name
   */
  private selectNode({ node }: Node) {

    this.emitChange({
      selectedNode: node,
      componentData: this._componentData,
      action: 'NODE_SELECTED'
    });

  }

  /**
   * Build a matcher for a node search query
   * @param  {String} query search term
   * @param  {Boolean} fuzzy whether or not to use strict matching
   * @return {Function}
   */
  private findNodeByNameBuilder(query: string, fuzzy: boolean) {
    if (fuzzy) {
      return node => node.name &&
      node.name.toLocaleLowerCase().includes(query);
    } else {
      return node => node.name &&
        new RegExp('^' + query + '$').test(node.name.toLocaleLowerCase());
    }
  }

  /**
   * Build a matcher for a node search query for node description array
   * @param  {String} query search term
   * @param  {Boolean} fuzzy whether or not to use strict matching
   * @return {Function}
   */
  private findNodeByDescription(query: string, fuzzy: boolean) {
    if (fuzzy) {
      return node => node.description && node.description.length > 0
        &&  node.description.filter((value) => {
          return value.key && value.key.toLocaleLowerCase().includes(query)
          || value.value &&
              value.value.toString().toLocaleLowerCase().includes(query);
        }).length > 0;
    } else {
      return node => node.description && node.description.length > 0
        && node.description.filter((value) => {
          return value.key &&
            (new RegExp('^' + query + '$')
              .test(value.key.toLocaleLowerCase()))
          || value.value &&
            (new RegExp('^' + query + '$')
              .test(value.value.toString().toLocaleLowerCase()));
        }).length > 0;
    }
  }

  /**
   * Copy the object while stripping out the children list
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

    const findNode = this.findNodeByNameBuilder(query, false);
    const fuzzyFindNode = this.findNodeByNameBuilder(query, true);
    const findNodeByDescription = this.findNodeByDescription(query, false);
    const fuzzyFindNodeByDescription = this.findNodeByDescription(query, true);
    const flattenedData = this.flatten(this._componentData);

    const node = flattenedData.find(findNode) ||
      flattenedData.find(fuzzyFindNode) ||
      flattenedData.find(findNodeByDescription) ||
      flattenedData.find(fuzzyFindNodeByDescription);

    if (node) {
      this.selectNode({ node });
    }

  }

}
