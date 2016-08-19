import {DebugElement} from '@angular/core';

import {Change} from './change';
import {Node} from './node';

import { transform } from './transformer';

export class Tree {
  public root: Node;

  constructor(root: DebugElement) {
    const cache = new Map();

    this.root = transform(root, cache);

    cache.clear();
  }

  diff(previous: Tree): Array<Change> {
    return [];
  }

  patch(changes: Array<Change>) {
    debugger;
  }
}