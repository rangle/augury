import {EventEmitter} from '@angular/core';

import {
  AsyncSubject,
  BehaviorSubject,
  ReplaySubject,
  Subscriber,
  Observable,
  Subject,
} from 'rxjs';

import {
  Path,
  serializePath,
} from './path';

import {functionName} from '../utils';

export enum PropertyMetadata {
  Input         = 0x1,
  Output        = 0x2,
  Subject       = 0x4,
  Observable    = 0x8,
  EventEmitter  = 0x10,
}

export type Metadata = Map<any, PropertyMetadata>;

export interface InstanceValue {
  instance;
  metadata: any | Metadata;
}

export const instanceWithMetadata =
    (instance, inputs: Set<string>, outputs: Set<string>): InstanceValue => {
  const map = new Map<any, PropertyMetadata>();

  if (instance != null) {
    for (const key of Object.keys(instance)) {
      loadMetadata(inputs, outputs, instance[key], key, map);
    }
  }

  const metadataArray = new Array<any>();

  map.forEach(
    (value, key) => {
      if (value !== 0) { // zero is not worth serializing and sending to UI
        metadataArray.push([key, value]);
      }
    });

  // It is very important that both the instance and metadata objects are part
  // of the same object so that they get serialized together in {@link serialize}.
  // This is because both instance and metadata refer to the same object instances,
  // so they must be serialized together for those references to remain intact.
  return {instance, metadata: metadataArray};
};

const loadMetadata =
    (inputs: Set<string>, outputs: Set<string>, instance, top: string, map: Metadata) => {
  if (map.has(instance)) {
    return;
  }

  let flags: PropertyMetadata = 0;

  if (instance != null && isScalar(instance) === false) {
    switch (functionName(instance.constructor)) {
      case functionName(EventEmitter):
        flags |= PropertyMetadata.EventEmitter;
        break;
      case functionName(AsyncSubject):
      case functionName(BehaviorSubject):
      case functionName(ReplaySubject):
      case functionName(Subject):
        flags |= PropertyMetadata.Subject | PropertyMetadata.Observable;
        break;
      case functionName(Observable):
      case functionName(Subscriber):
        flags |= PropertyMetadata.Observable;
        break;
      default:
        for (const key of Object.keys(instance)) {
          const value = instance[key];

          map.set(instance, flags);

          if (map.has(value) === false) {
            loadMetadata(inputs, outputs, value, null, map);
          }
        }
        break;
    }
  }

  if (top) {
    if (inputs.has(top)) {
      flags |= PropertyMetadata.Input;
    }
    else if (outputs.has(top)) {
      flags |= PropertyMetadata.Output;
    }
  }

  map.set(instance, flags);
};

const isScalar = value => {
  switch (typeof value) {
    case 'string':
    case 'boolean':
    case 'function':
    case 'undefined':
      return true;
    default:
      return false;
  }
};
