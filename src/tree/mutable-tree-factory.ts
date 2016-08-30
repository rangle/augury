import {DebugElement} from '@angular/core';

import {MutableTree} from './mutable-tree';
import {transform} from './transformer';
import {Node} from './node';

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
