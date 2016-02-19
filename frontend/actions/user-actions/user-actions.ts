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
  ) {
  }

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
  searchNode({ query }) {

    this.dispatcher.messageBus.next({
      actionType: UserActionType.SEARCH_NODE,
      query
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

  openCloseNode({node}) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.OPEN_CLOSE_TREE,
      node
    });
  }

  updateNodeState({openedNodes}) {
    this.dispatcher.messageBus.next({
      actionType: UserActionType.UPDATE_NODE_STATE,
      openedNodes
    });
  }

}
