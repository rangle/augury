import {Change} from './change';
import {Node} from './node';

import {transform} from './transformer';

export const transformToTree = (root) => {
  const cache = new Map();
  try {
    return transform(root, cache);
  }
  finally {
    cache.clear();
  }
}

export const createTree = (root) => {
  const isDebugElement = typeof root.nativeElement !== 'string';

  const tree = new MutableTree();

  if (isDebugElement) {
    tree.root = transformToTree(root);
  }
  else {
    tree.root = root;
  }

  return tree;
}

export class MutableTree {
  public root: Node;

  diff(previous: MutableTree): Array<Change> {
    return [];
  }

  patch(changes: Array<Change>) {
    debugger;
  }
}