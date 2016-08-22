import {Injectable} from '@angular/core';

import {Connection} from '../../channel/connection';

import {
  ExpandState,
  ViewState,
} from '../../state';

import {
  Node,
  Path,
} from '../../../tree';

import {MessageFactory} from '../../../communication';

@Injectable()
export class UserActions {
  constructor(
    private connection: Connection,
    private viewState: ViewState
  ) {}

  selectComponent(node: Node, requestInstance: boolean = true): Promise<any> {
    this.viewState.select(node);

    return this.connection.send(MessageFactory.selectComponent(node, requestInstance));
  }

  /// Toggle the expansion state of a node
  toggle(node: Node) {
    switch (this.viewState.expandState(node)) {
      case ExpandState.Collapsed:
        this.viewState.expandState(node, ExpandState.Expanded);
        break;
      case ExpandState.Expanded:
      default:
        this.viewState.expandState(node, ExpandState.Collapsed);
        break;
    }
  }

  /// Update a property inside of the component tree
  updateProperty(path: Path, newValue) {
    return this.connection.send(MessageFactory.updateProperty(path, newValue));
  }

  /// Emit a new value through an EventEmitter object
  emitValue(path: Path, value?) {
    return this.connection.send(MessageFactory.emitValue(path, value));
  }

  /**
   * Search for a node to be highlighted
   * @param  {String} options.query
   */
  searchNode(query: string, index: number) {
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

  /// Highlight a node element on the page
  highlight(node: Node) {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.HIGHLIGHT_NODE,
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
   * Dispatch the event to render router tree
   */
  renderRouterTree() {
    // this.messagingService.sendMessageToBackend({
    //   actionType: UserActionType.RENDER_ROUTER_TREE
    // });
  }
}
