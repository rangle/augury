import {DebugElement} from '@angular/core';

import {Change} from './change';
import {Node} from './node';
import {deserialize} from '../utils';
import {transform} from './transformer';
import {
  Path,
  deserializePath,
} from './path';

const patch = require('json8-patch');

export const transformToTree = (root, index: number, includeElements: boolean) => {
  const map = new Map<string, Node>();
  try {
    return transform(null, [index], root, map, includeElements);
  }
  finally {
    map.clear(); // release references
  }
};

export const createTree = (roots: Array<Node>) => {
  const tree = new MutableTree();
  tree.roots = roots;
  return tree;
};

export const createTreeFromElements = (roots: Array<DebugElement>, includeElements: boolean) => {
  const tree = new MutableTree();
  tree.roots = roots.map((r, index) => transformToTree(r, index, includeElements));
  return tree;
};

export class MutableTree {
  public roots: Array<Node>;

  /// Compare this tree to another tree and generate a delta
  diff(nextTree: MutableTree): Array<Change> {
    return patch.diff(this.roots, nextTree.roots);
  }

  /// Apply a set of changes to this tree, mutating it
  patch(changes: Array<Change>) {
    this.roots = patch.apply(this.roots, changes).doc;
  }

  /// Search for a node in the tree based on its path. An ID is a path that
  /// has been serialized into a string. So we deserialize the path and then
  /// traverse the tree using that information so that the search is much
  /// faster because we do not have to compare every node in the tree. This
  /// is not really a search. We just deserialize the ID, which is a path,
  /// and then follow that path to the node that we need. There is no
  /// searching involved, so this is a very fast operation.
  search(id: string) {
    return this.traverse(deserializePath(id));
  }

  /// Retreive a node matching {@link path} (fast)
  traverse(path: Path): Node {
    const root = this.roots[path.shift()];
    if (root == null) {
      return null;
    }

    let iterator = root;

    for (const index of path) {
      if (iterator == null) {
        return null;
      }

      switch (typeof index) {
        case 'number':
          if (iterator.children.length <= index) {
            return null; // not found
          }
          iterator = iterator.children[index];
          break;
        case 'string':
          iterator = iterator[index];
          break;
      }
    }

    return iterator;
  }

  /// Apply a function to all nodes in the specified tree index
  recurse(rootIndex: number, fn: (node: Node) => boolean | void) {
    const apply = (node: Node) => {
      fn(node);

      for (const child of node.children || []) {
        if (apply(child) === false) {
          return false;
        }
      }
    };

    return apply(this.roots[rootIndex]);
  }

  /// Apply a function recursively to all nodes in all roots
  recurseAll(fn: (node: Node) => boolean | void) {
    for (let index = 0; index < this.roots.length; ++index) {
      if (this.recurse(index, fn) === false) {
        return false;
      }
    }
  }

  filter(fn: (node: Node) => boolean): Array<Node> {
    const results = new Array<Node>();

    this.recurseAll(node => {
      if (fn(node)) {
        results.push(node);
      }
    });

    return results;
  }
}
