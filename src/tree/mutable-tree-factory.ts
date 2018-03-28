import {MutableTree} from './mutable-tree';
import {Node} from './node';
import {SimpleOptions} from '../options';

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
