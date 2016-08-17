import {DebugElement} from '@angular/core';

import {Subject} from 'rxjs';

import {
  Tree,
  TreeFactory,
} from '../tree';

import {
  MessageFactory,
  sendToExtension,
} from '../channel';

declare const ng;
declare const getAllAngularRootElements: () => Element[];

const bind = (root: DebugElement) => {
  const subject = new Subject<void>();

  const ngZone = root.injector.get(ng.coreTokens.NgZone);
  if (ngZone) {
    ngZone.onStable.subscribe(() => subject.next(void 0));
  }

  subject.debounceTime(0).subscribe(() => updateTree(root));
};

const lastTree = new Map<DebugElement, Tree>();

const updateTree = (root: DebugElement) => {
  const newTree = TreeFactory.fromRoot(root);

  const previousTree = lastTree.get(root);
  if (previousTree) {
    const difference = previousTree.diff(newTree);

    sendToExtension(MessageFactory.treeDiff(root, difference));
  }
  else {
    sendToExtension(MessageFactory.completeTree(root, newTree));
  }

  lastTree.set(root, newTree);
};

getAllAngularRootElements().forEach(root => bind(ng.probe(root)));
