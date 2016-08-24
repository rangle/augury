import {DebugElement} from '@angular/core';

import {Subject} from 'rxjs';

import {
  MutableTree,
  Node,
  Path,
  createTreeFromElements,
  deserializePath,
} from '../tree';

import {
  Message,
  MessageFactory,
  MessageType,
  browserSubscribe,
} from '../communication';

import {send} from './indirect-connection';

import {
  Route,
  MainRoute,
  parseRoutes,
} from './utils';

declare const ng;
declare const getAllAngularRootElements: () => Element[];

/// NOTE(cbond): We collect roots from all applications (mulit-app support)
let previousTree: MutableTree;

/// Collect just components or also HTML elements?
let includeElements: boolean;

const updateTree = (roots: Array<DebugElement>) => {
  const newTree = createTreeFromElements(roots, includeElements);

  send<void, any>(
    previousTree
      ? MessageFactory.treeDiff(previousTree.diff(newTree))
      : MessageFactory.completeTree(newTree));

  previousTree = newTree;
};

const update = () =>
  updateTree(getAllAngularRootElements().map(r => ng.probe(r)));

const subject = new Subject<void>();

const bind = (root: DebugElement) => {
  const ngZone = root.injector.get(ng.coreTokens.NgZone);
  if (ngZone) {
    ngZone.onStable.subscribe(() => subject.next(void 0));
  }

  subject.debounceTime(0).subscribe(() => update());

  subject.next(void 0); // initial load
};

getAllAngularRootElements().forEach(root => bind(ng.probe(root)));

browserSubscribe(
  (message: Message<any>) => {
    switch (message.messageType) {
      case MessageType.Initialize:
        const defaults = {showElements: false};

        includeElements = (message.content || defaults).showElements;

        // Clear out existing tree representation and start over
        previousTree = null;

        // Load the complete component tree
        subject.next(void 0);

        return true;
      case MessageType.SelectComponent:
        const path: Path = message.content.path;

        const node = previousTree.traverse(path);

        this.consoleReference(node);

        // For component selection events, we respond with component instance
        // properties for the selected node. If we had to serialize the
        // properties of each node on the tree that would be a performance
        // killer, so we only send the componentInstance values for the
        // node that has been selected.
        if (message.content.requestInstance) {
          return getComponentInstance(previousTree, node);
        }
        break;
      case MessageType.UpdateProperty:
        return tryWrap(() => updateProperty(previousTree,
          message.content.path,
          message.content.newValue));
      case MessageType.EmitValue:
        return tryWrap(() => emitValue(previousTree,
          message.content.path,
          message.content.value));
      case MessageType.RouterTree:
        return tryWrap(() => routerTree());
    }
    return undefined;
  });

// We do not store component instance properties on the node itself because
// we do not want to have to serialize them across backend-frontend boundaries.
// So we look them up using ng.probe, and only when the node is selected.
const getComponentInstance = (tree: MutableTree, node: Node) => {
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      return probed.componentInstance;
    }
  }
  return null;
};

const tickApplication = (path: Path) => {
  if (path == null || path.length === 0) {
    return;
  }

  const rootIndex: number = <number> path[0];

  const app = ng.probe(getAllAngularRootElements()[rootIndex]);
  const applicationRef = app.injector.get(ng.coreTokens.ApplicationRef);
  applicationRef.tick();
};

const updateProperty = (tree: MutableTree, path: Path, newValue) => {
  const node = tree.traverse(path.slice(0, path.length - 1));
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      probed.componentInstance[path.pop()] = newValue;
    }
  }

  tickApplication(path);
};

const emitValue = (tree: MutableTree, path: Path, newValue) => {
  const node = tree.traverse(path.slice(0, path.length - 1));
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      probed.componentInstance[path.pop()].emit(newValue);
    }
  }

  tickApplication(path);
};

export const rootsWithRouters = () => {
  const roots = getAllAngularRootElements().map(e => ng.probe(e));

  const routers = [];

  for (const element of getAllAngularRootElements().map(e => ng.probe(e))) {
    if (element == null ||
        element.componentInstance == null ||
        element.componentInstance.router == null) {
      continue;
    }
    routers.push(element.componentInstance.router);
  }

  return routers;
};

export const routerTree = (): Array<MainRoute> => {
  let routes = new Array<MainRoute>();

  for (const router of rootsWithRouters()) {
    routes = routes.concat(parseRoutes(router));
  }

  return routes;
};

export const consoleReference = (node: Node) => {
  const propertyKey = '$a';

  Object.defineProperty(window, propertyKey, {
    get: () => {
      if (node) {
        return ng.probe(node.nativeElement());
      }
      return null;
    }
  });
};

export const tryWrap = (fn: Function) => {
  try {
    let result = fn();
    if (result === undefined) {
      result = true;
    }
    return result;
  }
  catch (error) {
    return error;
  }
};

// NOTE(cbond): This is required to look up nodes based on a path from the
// frontend. The only place it is used right now is in the inspectElement
// operation. It would be nice if there were a cleaner way to do this.
Object.assign(window, {
  pathLookupNode: (id: string) => {
    const node = previousTree.search(id);
    if (node == null) {
      console.error(`Cannot find element associated with node ${id}`);
      return null;
    }
    return node.nativeElement();
  }
});

