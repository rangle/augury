import {
  AsyncSubject,
  BehaviorSubject,
  ReplaySubject,
  Subscriber,
  Observable,
  Subject,
} from 'rxjs';

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

export type Metadata = Map<any, [ObjectType, any]>;

export interface InstanceWithMetadata {
  instance: any;
  metadata: Metadata;
}

// It is imperative that the metadata and the instance value itself travel together
// through the serializer, otherwise we are going to have to serialize the entire
// object structure twice, once for the instance and once for the metadata. But if
// we put them together as part of the same object, the serializer will be smart
// enough not to duplicate objects. If someone breaks apart the instance and the
// metadata into two objects, a lot of code that depends on reference equality is
// going to get broken! So do not change this!
export const instanceWithMetadata = (node: Node, instance) => {
  if (node == null || instance == null) {
    return null;
  }

  const metadata = new Map<string, [ObjectType, any]>();

  recurse(instance,
    obj => {
      let type = objectType(obj);

      const update = (flag: ObjectType, additionalProps) => {
        const existing = metadata.get(obj);
        if (existing) {
          existing[0] |= flag;
          Object.assign(existing, additionalProps);
        }
        else {
          metadata.set(obj, [flag, additionalProps]);
        }
      };

      const component = componentMetadata(obj);
      if (component) {
        for (const input of componentInputs(component, obj)) {
          update(ObjectType.Input, {alias: input.bindingPropertyName});
        }
        for (const output of componentOutputs(component, obj)) {
          update(ObjectType.Output, {alias: output.bindingPropertyName});
        }

        const addQuery = (decoratorType: string, objectType: ObjectType) => {
          for (const vc of componentQueryChildren(decoratorType, component, obj)) {
            update(objectType, {selector: vc.selector});
          }
        };

        addQuery('@ViewChild', ObjectType.ViewChild);
        addQuery('@ViewChildren', ObjectType.ViewChildren);
        addQuery('@ContentChild', ObjectType.ContentChild);
        addQuery('@ContentChildren', ObjectType.ContentChildren);
      }

      if (type !== 0) {
        const existing = metadata.get(obj);
        if (existing) {
          metadata.set(obj, [existing[0] | type, existing[1]]);
        }
        else {
          metadata.set(obj, [type, null]);
        }
      }
    });

  return {instance, metadata: Array.from(<any> metadata)};
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
