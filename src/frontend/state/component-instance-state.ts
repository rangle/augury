import { ChangeDetectorRef } from '@angular/core';

import { InstanceWithMetadata, Node } from '../../tree';

export enum ComponentLoadState {
  Idle,
  Received,
  Loading,
  Failed
}

class CachedValue {
  constructor(public state: ComponentLoadState, public value: InstanceWithMetadata | null) {}
}

class LookupError {
  constructor(public error: Error) {}
}

export class ComponentInstanceState {
  constructor(private changeDetector: ChangeDetectorRef) {}

  private map = new Map<string, LookupError | CachedValue>();

  has(node: Node): boolean {
    return this.map.has(node.id);
  }

  loadingState(node: Node): ComponentLoadState {
    if (node == null) {
      return null;
    }

    const cache = this.map.get(node.id);

    if (cache == null || cache instanceof LookupError) {
      return ComponentLoadState.Failed;
    }

    return (<CachedValue>cache).state;
  }

  componentInstance(node: Node): InstanceWithMetadata {
    if (node == null) {
      return null;
    }

    const cache = this.map.get(node.id);

    if (cache == null || cache instanceof LookupError) {
      return null;
    }

    const existing = <CachedValue>cache;

    switch (existing.state) {
      case ComponentLoadState.Failed:
        return null;
      case ComponentLoadState.Received:
        return existing.value;
      case ComponentLoadState.Loading:
        return existing.value; // could be null
      default:
        throw new Error(`Unknown state: ${existing.state}`);
    }
  }

  wait(node: Node, promise: Promise<InstanceWithMetadata>) {
    const previouslyCached = this.componentInstance(node); // null if first time
    this.map.set(node.id, new CachedValue(ComponentLoadState.Loading, previouslyCached));

    promise
      .then(response => {
        this.map.set(node.id, new CachedValue(ComponentLoadState.Received, response));

        this.changeDetector.detectChanges();
      })
      .catch(error => {
        this.map.set(node.id, new LookupError(error));

        this.changeDetector.detectChanges();
      });
  }

  reset(identifiers?: Array<string>) {
    if (identifiers == null || identifiers.length === 0) {
      this.map.clear();
    } else {
      for (const id of identifiers) {
        this.map.delete(id);
      }
    }
  }
}
