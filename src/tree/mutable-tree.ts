const patch = require('json8-patch');

import {Change} from './change';
import {Node} from './node';
import {transform} from './transformer';

export const transformToTree = (root) => {
  return transform(root, new WeakMap());
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

const recurse = (node: Node, fn: (node: Node) => void) => {
  fn(node);

  node.children.forEach(n => recurse(n, fn));
}

export class MutableTree {
  public root: Node;

  diff(nextTree: MutableTree): Array<Change> {
    return patch.diff(this.root, nextTree.root);
  }

  patch(changes: Array<Change>) {
    this.root = patch.apply(this.root, changes).doc;
  }

  recurse(fn: (node: Node) => void) {
    recurse(this.root, fn);
  }
}
