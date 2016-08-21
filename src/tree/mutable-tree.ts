// TODO(cbond): Replace json8-patch with something that does better diffs?
const patch = require('json8-patch');

import {Change} from './change';
import {Node} from './node';
import {deserializePath} from './path';
import {deserialize} from '../utils';
import {transform} from './transformer';

export const transformToTree = (root) => {
  const map = new Map<string, Node>();
  try {
    return transform(null, [], root, map);
  }
  finally {
    map.clear(); // release references
  }
}

export const createTree = (root) => {
  const tree = new MutableTree();

  const isDebugElement = typeof root.nativeElement !== 'string';
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

  /// Compare this tree to another tree and generate a delta
  diff(nextTree: MutableTree): Array<Change> {
    return patch.diff(this.root, nextTree.root);
  }

  /// Apply a set of changes to this tree, mutating it
  patch(changes: Array<Change>) {
    this.root = patch.apply(this.root, changes).doc;
  }

  /// Apply a function to a tree recursively
  recurse(fn: (node: Node) => boolean | void) {
    const apply = (node: Node) => {
      fn(node);

      for (const child of node.children || []) {
        if (apply(child) === false) {
          return false;
        }
      }
    };

    apply(this.root);
  }

  /// Search for a node in the tree based on its path
  search(id: string) {
    let result: Node;

    const apply = (node: Node): boolean => {
      if (node.id === id) {
        result = node;
        return false;
      }
    };

    this.recurse(apply);

    return result;
  }

  traverse(path: Array<number>): Node {
    let iterator = this.root;

    for (const index of path) {
      if (iterator.children.length <= index) {
        return null; // not found
      }
      iterator = iterator.children[index];
    }

    return iterator;
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
