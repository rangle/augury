import { MutableTree } from './mutable-tree';
import { transform } from './transformer';
import { transformIvy } from './transformer-ivy';
import { Node } from './node';
import { SimpleOptions } from '../options';
import { isIvyVersion } from '../backend/utils/app-check';

export const transformToTree = (root, index: number, options: SimpleOptions, increment: (n: number) => void) => {
  const map = new Map<string, Node>();
  try {
    if (isIvyVersion()) {
      return transformIvy([index], root, options, map, increment);
    } else {
      return transform([index], root, options, map, increment);
    }
  } finally {
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

export const createTreeFromElements = (roots: Array<any>, options: SimpleOptions): ElementTransformResult => {
  const tree = new MutableTree();

  /// Keep track of the number of nodes that we process as part of this transformation
  let count = 0;

  tree.roots = roots.map((r, index) => transformToTree(r, index, options, n => (count += n)));

  return { tree, count };
};
