import {Injectable} from '@angular/core';

import {Connection} from '../../channel/connection';

import {UserActionType} from '../action-constants';

import {
  ExpansionState,
  NodeRenderState,
} from '../../state';

import {Node} from '../../../tree';

import {MessageFactory} from '../../../communication';

@Injectable()
export class UserActions {
  constructor(
    private connection: Connection,
    private expansionState: NodeRenderState
  ) {}

  collapseComponent(node: Node) {
    this.expansionState.setExpansionState(node, ExpansionState.Collapsed);
  }

  expandComponent(node: Node) {
    this.expansionState.setExpansionState(node, ExpansionState.Expanded);
  }

  selectComponent(node: Node): Promise<void> {
    return <Promise<void>> <any> this.connection.send(MessageFactory.selectComponent(node))
  }

  /**
   * Search for a node to be highlighted
   * @param  {String} options.query
   */
  searchNode({ query, index }) {
    // this.dispatcher.messageBus.next({
    //   actionType: UserActionType.SEARCH_NODE,
    //   query,
    //   index
    // });
  }

  /**
   * Clear the highlight from the web page
   */
  clearHighlight() {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.CLEAR_HIGHLIGHT
    // });
  }

  /**
   * Highlight the element on web page
   * @param  {Node} current element node
   */
  highlight({node}) {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.HIGHLIGHT_NODE,
    //   node
    // });
  }

  /**
   * On clicking expand and collapse of Component store the values in store
   * @param  {Object} options.node
   */
  openCloseNode({node}) {
    // this.dispatcher.messageBus.next({
    //   actionType: UserActionType.OPEN_CLOSE_TREE,
    //   node
    // });
  }

  /**
   * Get the list of dependent Components when clicking on dependency
   * @param  {String} dependency Name of the dependency
   */
  getDependencies(dependency: string) {
    // this.dispatcher.messageBus.next({
    //   actionType: UserActionType.GET_DEPENDENCIES,
    //   dependency
    // });
  }

  /**
   * Update the Component property when updating from info panel
   * @param  {Object} options.property
   */
  updateProperty({property}) {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.UPDATE_PROPERTY,
    //   property
    // });
  }

  /**
   * Dispatch the event to render router tree
   */
  renderRouterTree() {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.RENDER_ROUTER_TREE
    // });
  }

  fireEvent(data: any) {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.FIRE_EVENT,
    //   data
    // });
  }
}
