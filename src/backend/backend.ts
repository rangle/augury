import {DebugElement} from '@angular/core';

import {Subject} from 'rxjs';

import {
  MutableTree,
  Node,
  Path,
  createTreeFromElements,
} from '../tree';

import {
  Message,
  MessageFactory,
  MessageType,
  browserSubscribe,
} from '../communication';

import {send} from './indirect-connection';

declare const ng;
declare const getAllAngularRootElements: () => Element[];

/// NOTE(cbond): We collect roots from all applications (mulit-app support)
let previousTree: MutableTree;

/// Collect just components or also HTML elements?
let includeElements: boolean;

const updateTree = (roots: Array<DebugElement>) => {
  const newTree = createTreeFromElements(roots, includeElements);

  let delta = false;

  if (previousTree) {
    // In certain cases with large trees the JSON diff tool blows up with a
    // stack overflow error. In the event we encounter that, instead of just
    // silently failing we will re-send the tree instead of the delta.
    try {
      send(MessageFactory.treeDiff(previousTree.diff(newTree)));
      delta = true;
    }
    catch (error) {}
  }

  if (delta === false) {
    send(MessageFactory.completeTree(newTree));
  }

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
        updateProperty(previousTree,
          message.content.path,
          message.content.newValue);
        break;
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

const updateProperty = (tree: MutableTree, path: Path, newValue) => {
  const node = tree.traverse(path.slice(0, path.length - 1));
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      probed.componentInstance[path.pop()] = newValue;
    }
  }

  const rootIndex: number = <number> path[0];

  const app = ng.probe(getAllAngularRootElements()[rootIndex]);
  const applicationRef = app.injector.get(ng.coreTokens.ApplicationRef);
  applicationRef.tick();
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
