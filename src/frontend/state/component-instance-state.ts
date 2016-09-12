import {ChangeDetectorRef} from '@angular/core';

import {
  InstanceValue,
  Metadata,
  PropertyMetadata,
  Node,
} from '../../tree';

export enum ComponentLoadState {
  Idle,
  Received,
  Failed
}

class CachedValue {
  constructor(
    public state: ComponentLoadState,
    public value: InstanceValue
  ) {}
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

    return (<CachedValue> cache).state;
  }

  componentInstance(node: Node): InstanceValue {
    if (node == null) {
      return null;
    }

    const cache = this.map.get(node.id);

    if (cache == null || cache instanceof LookupError) {
      return null;
    }

    const existing = <CachedValue> cache;

    switch (existing.state) {
      case ComponentLoadState.Failed:
        return null;
      case ComponentLoadState.Received:
        return existing.value;
      default:
        throw new Error(`Unknown state: ${existing.state}`);
    }
  }

  wait(node: Node, promise: Promise<InstanceValue>) {
    promise.then(response => {
      const metadata = toMap(response.metadata);

      const value = {instance: response.instance, metadata};

      this.map.set(node.id, new CachedValue(ComponentLoadState.Received, value));

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
    }
    else {
      for (const id of identifiers) {
        this.map.delete(id);
      }
    }
  }
}

const toMap = (array): Metadata => {
  const map = new Map<any, PropertyMetadata>();

  for (const item of array) {
    map.set(item[0], item[1]);
  }

  return map;
};
