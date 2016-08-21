// TODO(cbond): Replace json8-patch with something that does better diffs?
const patch = require('json8-patch');

import {Change} from './change';
import {Node} from './node';
import {deserialize} from '../utils';
import {transform} from './transformer';

export const transformToTree = (root) => {
  const map = new Map<string, Node>();
  try {
    return transform(null, root, map);
  }
  finally {
    map.clear(); // release references
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

  // NOTE(cbond): If we want to send the component instance and context data,
  // then uncomment this method that will hydrate those properties from the
  // serialized type that they arrived in over the message channel.
  //
  // hydrate() {
  //   this.recurse(node => {
  //     if (typeof node.componentInstance === 'string') {
  //       node.componentInstance = deserialize(node.componentInstance);
  //     }
  //     if (typeof node.context === 'string') {
  //       node.context = deserialize(node.context)
  //     }
  //   });
  // }
}
