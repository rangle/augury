import {DebugElement} from '@angular/core';

import {Subject} from 'rxjs';

import {
  MutableTree,
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

const updateTree = (roots: Array<DebugElement>) => {
  const newTree = createTreeFromElements(roots);

  if (previousTree) {
    const difference = previousTree.diff(newTree);

    send(MessageFactory.treeDiff(difference));
  }
  else {
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
        // Clear out existing tree representation and start over
        previousTree = null;

        // Load the complete component tree
        subject.next(void 0);

        return true;
      case MessageType.SelectComponent:
        // For component selection events, we respond with component instance
        // properties for the selected node. If we had to serialize the
        // properties of each node on the tree that would be a performance
        // killer, so we only send the componentInstance values for the
        // node that has been selected.
        if (message.content.requestInstance) {
          return getComponentInstance(previousTree, message.content.path);
        }
    }
    return undefined;
  });

// We do not store component instance properties on the node itself because
// we do not want to have to serialize them across backend-frontend boundaries.
// So we look them up using ng.probe, and only when the node is selected.
const getComponentInstance = (tree: MutableTree, path: Path) => {
  const node = tree.traverse(path);
  if (node) {
    const probed = ng.probe(node.nativeElement);
    if (probed) {
      return probed.componentInstance;
    }
  }
  return null;
};