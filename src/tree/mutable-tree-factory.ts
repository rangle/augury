import {MutableTree} from './mutable-tree';
import {transform} from './transformer';
import {Node} from './node';
import {SimpleOptions} from '../options';

import { diagnosable } from 'diagnostic-tools/backend';

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

export const createTreeFromElements
  = diagnosable({
    name: 'createTreeFromElements',
    pre: s => (roots: Array<any>, options: SimpleOptions) => {
      s.assert('roots is array', Array.isArray(roots))
      s.assert('roots is not empty', roots.length > 0);
      s.assert('options has diagnosticToolsEnabled', options.diagnosticToolsEnabled)
      s.remember({ number: 6 });
    },
    post: s => (result:any) => {
      s.assert('we got number', s.old('number'))
    }
  })
  (function (roots: Array<any>, options: SimpleOptions): ElementTransformResult {
    const tree = new MutableTree();

    /// Keep track of the number of nodes that we process as part of this transformation
    let count = 0;

    tree.roots = roots.map((r, index) => transformToTree(r, index, options, n => count += n));

    return {tree, count};
  });
