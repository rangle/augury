import {Injectable} from 'angular2/core';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {BackendActionType, UserActionType}
  from '../../actions/action-constants';
import {AbstractStore} from '../abstract-store';

interface Node {
  node: Object;
}
interface SearchCriteria {
  query: string;
  index: number;
}

@Injectable()
/**
 * Component Data Store
 */
export class ComponentDataStore extends AbstractStore {

  private _componentData;
  private _openedNodes = [];
  private _selectedNode;

  constructor(
    private dispatcher: Dispatcher
  ) {

    super();

    // Attach listeners to the dispatcher
    this.dispatcher.onAction(
      BackendActionType.COMPONENT_TREE_CHANGED,
      action => this.componentDataChanged(action.componentData));

    this.dispatcher.onAction(
      BackendActionType.CLEAR_SELECTIONS,
      action => this.clearSelections(action));

    this.dispatcher.onAction(
      UserActionType.SELECT_NODE,
      action => this.selectNodeAction(action));

    this.dispatcher.onAction(
      UserActionType.SEARCH_NODE,
      action => this.searchNode(action));

    this.dispatcher.onAction(
      UserActionType.OPEN_CLOSE_TREE,
      action => this.openCloseNode(action));

    this.dispatcher.onAction(
      UserActionType.UPDATE_NODE_STATE,
      action => this.updateNodeState(action));

    this.dispatcher.onAction(
      UserActionType.GET_DEPENDENCIES,
      action => this.getDependencies(action));

    this.dispatcher.onAction(
      BackendActionType.RENDER_ROUTER_TREE,
      action => this.renderRouterTree(action))

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
      selectedNode: this._selectedNode,
      openedNodes: this._openedNodes,
      action: UserActionType.START_COMPONENT_TREE_INSPECTION
    });
  }

  private selectNodeAction({ node }: Node) {
    this.selectNode(node);
  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node Node name
   */
  private selectNode(node: any, searchIndex: number = -1,
                     totalSearchCount: number = 0) {
    this._selectedNode = node;
    this.emitChange({
      selectedNode: this._selectedNode,
      searchIndex: searchIndex,
      totalSearchCount: totalSearchCount,
      componentData: this._componentData,
      action: UserActionType.SELECT_NODE
    });
  }

  private getUpdatedNode(selectedNode: any) {
    const flattenedData = this.flatten(this._componentData);
    const filtered = flattenedData.filter((node) =>
      node.id === selectedNode.id);
    return filtered.length > 0 ? filtered[0] : selectedNode;
  }

  private updateNodeState({openedNodes, selectedNode}) {
    selectedNode = this.getUpdatedNode(selectedNode);
    this.emitChange({
      openedNodes,
      selectedNode,
      action: UserActionType.OPEN_CLOSE_TREE
    });
  }

  private clearSelections(action) {
    this._openedNodes = [];
    this._selectedNode = undefined;
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
  private searchNode({ query, index }: SearchCriteria) {

    const findNode = this.findNodeByNameBuilder(query, false);
    const fuzzyFindNode = this.findNodeByNameBuilder(query, true);
    const findNodeByDescription = this.findNodeByDescription(query, false);
    const fuzzyFindNodeByDescription = this.findNodeByDescription(query, true);
    const flattenedData = this.flatten(this._componentData);

    const searched = flattenedData.filter(findNode).concat(
      flattenedData.filter(fuzzyFindNode),
      flattenedData.filter(findNodeByDescription),
      flattenedData.filter(fuzzyFindNodeByDescription));

    const filtered = [];
    const filteredMap = {};

    searched.forEach((searchItem) => {
      if (!filteredMap[searchItem.id]) {
        filtered.push(searchItem);
        filteredMap[searchItem.id] = true;
      }
    });

    const node = filtered.length > 0 ? filtered[index] : undefined;

    this.selectNode(node, index, filtered.length);

  }

  private openCloseNode({node}) {
    if (!node.isOpen) {
      this._openedNodes.push(node.id);
    } else {
      const index = this._openedNodes.indexOf(node.id);
      if (index > -1) {
        this._openedNodes.splice(index, 1);
      }
    }
  }

  private getDependencies({dependency}) {
    const flattenedData = this.flatten(this._componentData);
    const dependentComponents = flattenedData.filter((comp) =>
      comp.dependencies.indexOf(dependency) > -1);

    this.emitChange({
      selectedDependency: dependency,
      dependentComponents: dependentComponents,
      action: UserActionType.GET_DEPENDENCIES
    });
  }

  private renderRouterTree(tree: any) {
    this.emitChange({
      tree: tree,
      action: UserActionType.RENDER_ROUTER_TREE
    });
  }

}
