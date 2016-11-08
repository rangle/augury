import md5 = require('md5');

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
  deserializePath,
} from './path';

import {Node} from './node';

import {
  componentInputs,
  componentOutputs,
  componentMetadata,
  componentQueryChildren,
} from './decorators';

import {
  isScalar,
  functionName,
  recurse,
} from '../utils';

export enum ObjectType {
  Input           = 0x1,
  Output          = 0x2,
  Subject         = 0x4,
  Observable      = 0x8,
  EventEmitter    = 0x10,
  ViewChild       = 0x20,
  ViewChildren    = 0x40,
  ContentChild    = 0x80,
  ContentChildren = 0x100,
}

export type Metadata = Map<string, [ObjectType, any]>;

export interface InstanceWithMetadata {
  instance: any;
  metadata: Metadata;
}

export const instanceWithMetadata = (node: Node, instance): InstanceWithMetadata => {
  if (node == null || instance == null) {
    return null;
  }

  const metadata = new Map<string, [ObjectType, any]>();

  const nodePath = deserializePath(node.id);

  const serialize = (path: Path): string => md5(serializePath(path));

  recurse(nodePath, instance,
    (path: Path, obj) => {
      let type = objectType(obj);

      const update = (p: Path, flag: ObjectType, additionalProps) => {
        const serializedPath = serialize(p);

        const existing = metadata.get(serializedPath);
        if (existing) {
          existing[0] |= flag;
          Object.assign(existing, additionalProps);
        }
        else {
          metadata.set(serializedPath, [flag, additionalProps]);
        }
      };

      const component = componentMetadata(obj);
      if (component) {
        for (const input of componentInputs(component, obj)) {
          update(path.concat([input.propertyKey]), ObjectType.Input, {alias: input.bindingPropertyName});
        }
        for (const output of componentOutputs(component, obj)) {
          update(path.concat([output.propertyKey]), ObjectType.Output, {alias: output.bindingPropertyName});
        }

        const addQuery = (decoratorType: string, objectType: ObjectType) => {
          for (const vc of componentQueryChildren(decoratorType, component, obj)) {
            update(path.concat([vc.propertyKey]), objectType, {selector: vc.selector});
          }
        };

        addQuery('@ViewChild', ObjectType.ViewChild);
        addQuery('@ViewChildren', ObjectType.ViewChildren);
        addQuery('@ContentChild', ObjectType.ContentChild);
        addQuery('@ContentChildren', ObjectType.ContentChildren);
      }

      if (type !== 0) {
        const serializedPath = serialize(path);

        const existing = metadata.get(serializedPath);
        if (existing) {
          metadata.set(serializedPath, [existing[0] | type, existing[1]]);
        }
        else {
          metadata.set(serializedPath, [type, null]);
        }
      }
    });

  return {instance, metadata};
};

const objectType = (object): ObjectType => {
  if (object != null && !isScalar(object)) {
    switch (functionName(object.constructor)) {
      case 'EventEmitter':
        return ObjectType.EventEmitter;
      case functionName(AsyncSubject):
      case functionName(BehaviorSubject):
      case functionName(ReplaySubject):
      case functionName(Subject):
        return ObjectType.Subject | ObjectType.Observable;
      case functionName(Observable):
      case functionName(Subscriber):
        return ObjectType.Observable;
    }
  }
  return 0;
};
