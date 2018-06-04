// TODO: scrap

import {
  highlight,
  clear as clearHighlights
} from './highlighter';

import {
  MessageFactory
} from '../../communication';

import {send} from '../indirect-connection';

// Find a mutable tree  node based on its DOM target
export function onFindElement(e, tree) {
  let foundNode = null;

  const findNode = (node) => {
    if (node.nativeElement() === e.target) {
      foundNode = node;
    }
  };

  // recurse the tree
  tree.recurseAll(findNode);

  return foundNode;
}

export function onElementFound(node, highlights, buffer) {
  if (node) {
    buffer.enqueue(MessageFactory.foundDOMElement(node));
    send(MessageFactory.push());
  }

  // if there are highlights, clear them
  if (highlights) {
    clearHighlights(highlights.map);
  }
}
