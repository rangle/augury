import {DebugElement} from '@angular/core';

import {Tree} from './tree';

export abstract class TreeFactory {
  static fromRoot(rootElement: DebugElement) {
    return new Tree();
  }
}