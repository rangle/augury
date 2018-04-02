// @todo: put this file somewhere that makes more sense. also rename, etc.
// i only did this for now because i had to separate out
//      the stuff in the transformer.ts file that is used in the back end

import {MutableTree} from './mutable-tree';
import {transform} from './transformer';
import {Node} from './node';
import {SimpleOptions} from '../options';

export const transformToTree =
    (root, index: number, options: SimpleOptions, increment: (n: number) => void) => {
  const map = new Map<string, Node>();
  try {
    return transform([index], root, options, map, increment);
  }
  finally {
    map.clear(); // release references
  }
};

export interface ElementTransformResult {
  /// The tree containing a root for each application on the page
  tree: MutableTree;

  /// The total number of nodes transformed
  count: number;
}

export const createTreeFromElements =
    (roots: Array<any>, options: SimpleOptions): ElementTransformResult => {
  const tree = new MutableTree();

  /// Keep track of the number of nodes that we process as part of this transformation
  let count = 0;

  tree.roots = roots.map((r, index) => transformToTree(r, index, options, n => count += n));

  return {tree, count};
};
