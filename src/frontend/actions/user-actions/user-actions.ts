import {Injectable} from '@angular/core';

import {Connection} from '../../channel/connection';
import {MessageFactory} from '../../../communication';
import {Route} from '../../../backend/utils';
import {
  matchNode,
  matchRoute,
  matchString,
} from '../../utils';
import {
  ExpandState,
  ComponentViewState,
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
    private viewState: ComponentViewState
  ) {}

  /// Toggle the expansion state of a node
  toggle(node: Node, defaultState: ExpandState) {
    let state = this.viewState.expandState(node);
    if (state == null) {
      state = defaultState;
    }

    switch (state) {
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

  updateProvider(path: Path, providerKey: Path, newValue) {
    const [token, ...propertyPath] = providerKey;

    return this.connection.send(MessageFactory.updateProviderProperty(path, token, propertyPath, newValue));
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
  searchRouter(routerTree: Array<Route>, query: string): Promise<Array<Route>> {
    return new Promise((resolve, reject) => {
      const recurse = (node: Route, fn: (route: Route) => void) => {
        fn(node);

        if (node.children) {
          node.children.forEach(child => recurse(child, fn));
        }
      };

      const matches = new Array<Route>();

      routerTree.forEach(
        root => recurse(root,
          node => {
            if (matchString(query, node.name) ||
                matchString(query, node.path)) {
              matches.push(node);
            }
          }));

      if (matches.length > 0) {
        resolve(matches);
      }
      else {
        reject(new Error('No matching routes were found'));
      }
    });
  }

  clearHighlight() {
    return this.connection.send(MessageFactory.highlight([]));
  }

  highlight(node: Node) {
    return this.connection.send(MessageFactory.highlight([node]));
  }

  triggerEvent(node: Node, listener) {
    return this.connection.send(MessageFactory.emitEvent(node.id, listener.name));
  }

  findElement() {
    return this.connection.send(MessageFactory.findDOMElement());
  }

  cancelFindElement() {
    return this.connection.send(MessageFactory.foundDOMElement(null));
  }
}

