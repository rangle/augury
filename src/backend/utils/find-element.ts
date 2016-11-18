import {
  highlight,
  clear as clearHighlights
} from './highlighter';

import {
  MessageFactory
} from '../../communication';

import {send} from '../indirect-connection';

// Find a mutable tree dom node based on its DOM target
export function onFindElement(e, tree, highlights) {
  const findNode = (node) => {
    if (node.nativeElement() === e.target) {
      foundNode = node;
    }
  };

  // remove previous node
  let foundNode = null;

  if (highlights) {
    clearHighlights(highlights.map);
  }

  // recurse the tree
  tree.recurseAll(findNode);

  if (foundNode) {
    highlights = highlight([foundNode]);
  }

  return {
    currentHighlights: highlights,
    currentNode: foundNode
  };
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
