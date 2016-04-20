import {Injectable} from 'angular2/core';
import {Dispatcher} from '../../dispatcher/dispatcher';
import {UserActionType} from '../action-constants';
import {BackendMessagingService} from '../../channel/backend-messaging-service';

@Injectable()
/**
 * User Actions
 */
export class UserActions {

  constructor(
    private dispatcher: Dispatcher,
    private messagingService: BackendMessagingService
  ) { }

  /**
   * Get the component tree data from back-end
   */
  startComponentTreeInspection() {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.START_COMPONENT_TREE_INSPECTION
    });
  }

  /**
   * Select a node to be highlighted
   * @param  {Object} options.node
   */
  selectNode({ node }) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.SELECT_NODE,
      node
    });

    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.SELECT_NODE,
      node
    });
  }

  /**
   * Search for a node to be highlighted
   * @param  {String} options.query
   */
  searchNode({ query, index }) {

    this.dispatcher.messageBus.next({
      actionType: UserActionType.SEARCH_NODE,
      query,
      index
    });
  }

  /**
   * Clear the highlight from the web page
   */
  clearHighlight() {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.CLEAR_HIGHLIGHT
    });
  }

  /**
   * Highlight the element on web page
   * @param  {Node} current element node
   */
  highlight({node}) {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.HIGHLIGHT_NODE,
      node
    });
  }

  /**
   * On clicking expand and collapse of Component store the values in store
   * @param  {Object} options.node
   */
  openCloseNode({node}) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.OPEN_CLOSE_TREE,
      node
    });
  }

  /**
   * Update the node state after re rendering the tree.
   * Select the previously selected node and
   * Preserve state of previously Closed Component.
   * @param  {Object} options.openedNodes list of opened Nodes id's
   * @param  {Object} options.selectedNode currently selectedNode
   */
  updateNodeState({openedNodes, selectedNode}) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.UPDATE_NODE_STATE,
      openedNodes,
      selectedNode
    });
  }

  /**
   * Get the list of dependent Components when clicking on dependency
   * @param  {String} dependency Name of the dependency
   */
  getDependencies(dependency: string) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.GET_DEPENDENCIES,
      dependency
    });
  }

  /**
   * Update the Component property when updating from info panel
   * @param  {Object} options.property
   */
  updateProperty({property}) {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.UPDATE_PROPERTY,
      property
    });
  }

  /**
   * Dispatch the event to render router tree
   */
  renderRouterTree() {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.RENDER_ROUTER_TREE
    });
  }

  fireEvent(data: any) {
    this.messagingService.sendMessageToBackend({
      actionType: UserActionType.FIRE_EVENT,
      data
    });
  }

}
