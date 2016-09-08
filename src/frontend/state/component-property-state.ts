import {Injectable} from '@angular/core';

import {Path, serializePath} from '../../tree';

import {ExpandState} from './expand-state';

@Injectable()
export class ComponentPropertyState {
  private expanded = new Set<string>();

  toggleExpand(path: Path) {
    const serializedPath = serializePath(path);

    if (this.expanded.has(serializedPath)) {
      this.expanded.delete(serializedPath);
    }
    else {
      this.expanded.add(serializedPath);
    }
  }

  expansionState(path: Path): ExpandState {
    return this.expanded.has(serializePath(path))
      ? ExpandState.Expanded
      : ExpandState.Collapsed;
  }
}
