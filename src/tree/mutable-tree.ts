import {DebugElement} from '@angular/core';

import {Change} from './change';
import {Node} from './node';
import {deserialize} from '../utils';
import {transform} from './transformer';
import {
  Path,
  deserializePath,
} from './path';

import {apply, compare} from './patch';

export const transformToTree = (root, index: number, showElements: boolean) => {
  const map = new Map<string, Node>();

  const tasks = new Map<string, () => void>();

  try {
    const node = transform(tasks, null, [index], root, map, showElements);

    // Execute the remaining transform operations with a shallow call stack
    // to avoid recursive transform stack overflows
    do {
      execute(tasks);
    } while (tasks.size > 0);

    return node;
  }
  finally {
    map.clear(); // release references
  }
};

const execute = (tasks: Map<string, () => void>) => {
  const remove = new Set<string>();
  tasks.forEach((t, key) => {
    t();
    remove.add(key);
  });

  remove.forEach(k => tasks.delete(k));
};

export const createTree = (roots: Array<Node>) => {
  const tree = new MutableTree();
  tree.roots = roots;
  return tree;
};

export const createTreeFromElements = (roots: Array<DebugElement>, showElements: boolean) => {
  const tree = new MutableTree();
  tree.roots = roots.map((r, index) => transformToTree(r, index, showElements));
  return tree;
};

export class MutableTree {
  public roots: Array<Node>;

  /// Compare this tree to another tree and generate a delta
  diff(nextTree: MutableTree): Array<Change> {
    const changes = <Change[]> compare(this, nextTree);

    const exclude = /nativeElement$/;

    return changes.filter(c => exclude.test(c.path) === false);
  }

  /// Apply a set of changes to this tree, mutating it
  patch(changes: Array<Change>) {
    apply(this, changes);
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
    path = path.slice(0);

    const root = this.roots[path.shift()];
    if (root == null) {
      return null;
    }

    if (path.length === 0) {
      return root;
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
    const applyfn = (node: Node) => {
      fn(node);

      for (const child of node.children || []) {
        if (applyfn(child) === false) {
          return false;
        }
      }
    };

    return applyfn(this.roots[rootIndex]);
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
