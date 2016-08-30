import {Injectable} from '@angular/core';

import {Connection} from '../../channel/connection';
import {MessageFactory} from '../../../communication';
import {Route} from '../../../backend/utils';
import {
  matchNode,
  matchRoute,
} from '../../utils';
import {
  ExpandState,
  ViewState,
} from '../../state';
import {
  MutableTree,
  Node,
  Path,
} from '../../../tree';

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

  /// Search components and return result as nodes
  searchComponents(tree: MutableTree, query: string): Promise<Array<Node>> {
    return new Promise((resolve, reject) => {
      const results = tree.filter(node => matchNode(node, query));
      if (results.length > 0) {
        resolve(results);
      }
      else {
        reject(new Error('No results found'));
      }
    });
  }

  /// Search routers and return result as routes
  searchRouter(routerTree: Array<Route>, query: string): Promise<Array<any>> {
    return Promise.reject<Array<any>>(new Error('Not implemented'));
  }

  clearHighlight() {
    return this.connection.send(MessageFactory.highlight([]));
  }

  highlight(node: Node) {
    return this.connection.send(MessageFactory.highlight([node]));
  }

  renderRouterTree(): Promise<Route[]> {
    return this.connection.send<Route[], any>(MessageFactory.routerTree());
  }
}

