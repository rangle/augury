import {ChangeDetectorRef} from '@angular/core';

import {Node} from '../../tree';

export enum ComponentLoadState {
  Idle,
  Loading,
  Received,
  Failed
}

class CachedValue {
  constructor(
    public state: ComponentLoadState,
    public value
  ) {}
}

export class ComponentInstanceState {
  constructor(private changeDetector: ChangeDetectorRef) {}

  private map = new Map<string, CachedValue>();

  has(node: Node): boolean {
    return this.map.has(node.id);
  }

  loadingState(node: Node): ComponentLoadState {
    if (node == null) {
      return null;
    }
    const cache = this.map.get(node.id);
    if (cache == null) {
      return ComponentLoadState.Failed;
    }
    return cache.state;
  }

  componentInstance(node: Node) {
    if (node == null) {
      return null;
    }

    const cache = this.map.get(node.id);
    if (cache == null) {
      return null;
    }

    switch (cache.state) {
      case ComponentLoadState.Failed:
      case ComponentLoadState.Loading:
        return null;
      case ComponentLoadState.Received:
        return cache.value;
      default:
        throw new Error(`Unknown state: ${cache.state}`);
    }
  }

  wait(node: Node, promise: Promise<any>) {
    this.write(node, ComponentLoadState.Loading, promise);

    promise.then(response => {
      this.done(node, response);
    })
    .catch(error => {
      this.fail(node, error);
    });
  }

  write<T>(node: Node, state: ComponentLoadState, value) {
    this.map.set(node.id, new CachedValue(state, value));
    this.changeDetector.detectChanges();
  }

  done(node: Node, value) {
    this.write(node, ComponentLoadState.Received, value);
  }

  fail(node: Node, error: Error) {
    this.write(node, ComponentLoadState.Failed, error);
  }

  reset() {
      this.map.clear();
  }
}
