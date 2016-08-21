import {DebugElement} from '@angular/core';

import {Change} from './change';
import {Node} from './node';
import {deserialize} from '../utils';
import {transform} from './transformer';
import { Path, deserializePath } from './path';

const patch = require('json8-patch');

export const transformToTree = (root, index: number) => {
  const map = new Map<string, Node>();
  try {
    return transform(null, [index], root, map);
  }
  finally {
    map.clear(); // release references
  }
}

export const createTree = (roots: Array<Node>) => {
  const tree = new MutableTree();
  tree.roots = roots;
  return tree;
}

export const createTreeFromElements = (roots: Array<DebugElement>) => {
  const tree = new MutableTree();
  tree.roots = roots.map((r, index) => transformToTree(r, index));
  return tree;
}

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

    apply(this.roots[rootIndex]);
  }

  /// Search for a node in the tree based on its path
  search(id: string) {
    let result: Node;

    const path = deserializePath(id);
    if (path.length < 1) {
      throw new Error('No root element to search');
    }

    const rootIndex = <number> path.shift();

    const apply = (node: Node): boolean => {
      if (node.id === id) {
        result = node;
        return false;
      }
    };

    this.recurse(rootIndex, apply);

    return result;
  }

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
}
