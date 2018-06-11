import {MutableTree} from './mutable-tree';
import {transform} from './transformer';
import {Node} from './node';
import {SimpleOptions} from '../options';

export const transformToTree =
    (root, index: number, options: SimpleOptions, increment: (n: number) => void, { forEachNode }) => {
  const map = new Map<string, Node>();
  try {
    return transform([index], root, options, map, increment, { forEachNode });
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

export interface ElementTransformResult {
  /// The tree containing a root for each application on the page
  tree: MutableTree;

  /// The total number of nodes transformed
  count: number;
}

export const createTreeFromElements =
    (roots: Array<any>, options: SimpleOptions, { forEachNode }): ElementTransformResult => {
  const tree = new MutableTree();

  /// Keep track of the number of nodes that we process as part of this transformation
  let count = 0;

  tree.roots = roots.map((r, index) => transformToTree(r, index, options, n => count += n,
    { forEachNode }));

  return {tree, count};
};
