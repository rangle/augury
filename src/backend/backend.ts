import {DebugElement} from '@angular/core';

import {Subject} from 'rxjs';

import {
  MutableTree,
  createTree,
} from '../tree';

import {
  MessageFactory,
  MessageType,
  browserSubscribe,
} from '../communication';

import {send} from './indirect-connection';

declare const ng;
declare const getAllAngularRootElements: () => Element[];

const lastTree = new Map<DebugElement, MutableTree>();

const updateTree = (root: DebugElement) => {
  const newTree = createTree(root);

  const previousTree = lastTree.get(root);
  if (previousTree) {
    const difference = previousTree.diff(newTree);

    send(MessageFactory.treeDiff(root, difference));
  }
  else {
    send(MessageFactory.completeTree(root, newTree));
  }

  lastTree.set(root, newTree);
};

const update = () => {
  getAllAngularRootElements().forEach(root => updateTree(ng.probe(root)));
}
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
  message => {
    switch (message.messageType) {
      case MessageType.Initialize:
        // Clear out existing tree representations and start over
        lastTree.clear();

        // Load the complete component tree
        subject.next(void 0);

        return true;
    }
  });