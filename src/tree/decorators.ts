import {
  Component,
  DebugElement,
} from '@angular/core';

import {
  InputProperty,
  OutputProperty,
} from './node';

import {functionName} from '../utils';

export const classDecorators = (instance): Array<any> =>
  Reflect.getOwnMetadata('annotations', instance.constructor) || [];

export const propertyDecorators = (instance): Array<any> =>
  Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];

export const parameterTypes = (instance): Array<any> =>
  Reflect.getOwnMetadata('design:paramtypes', instance.constructor) || [];

export const iteratePropertyDecorators = (instance, fn: (key: string, decorator) => void) => {
  if (instance == null) {
    return;
  }

  const decorators = propertyDecorators(instance);

  for (const key of Object.keys(decorators)) {
    for (const meta of decorators[key]) {
      fn(key, meta);
    }
  }
};

export const componentMetadata = (instance): Component => {
  if (instance == null) {
    return null;
  }

  return classDecorators(instance).find(d => functionName(d.constructor) === functionName(Component));
};

export const componentInputs = (metadata: Component, instance): Array<InputProperty> => {
  const inputs: Array<InputProperty> =
    ((metadata && metadata.inputs) || []).map(p => ({propertyKey: p}));

  iteratePropertyDecorators(instance,
    (key: string, meta) => {
      if (inputs.find(i => i.propertyKey === key) == null) {
        if (meta.toString() === '@Input') {
          inputs.push({propertyKey: key, bindingPropertyName: meta.bindingPropertyName});
        }
      }
    });

  return inputs;
};

export const componentOutputs = (metadata: Component, instance): Array<OutputProperty> => {
  const outputs: Array<OutputProperty> =
    ((metadata && metadata.outputs) || []).map(p => ({propertyKey: p}));

  iteratePropertyDecorators(instance,
    (key: string, meta) => {
      if (meta.toString() === '@Output') {
        outputs.push({propertyKey: key, bindingPropertyName: meta.bindingPropertyName});
      }
    });

  return Array.from(outputs);
};

export interface Query {
  propertyKey: string;
  selector: string;
}

export const componentQueryChildren = (type: string, metadata: Component, instance): Array<Query> => {
  const queries = new Array<Query>();

  iteratePropertyDecorators(instance,
    (key: string, meta) => {
      if (meta.toString() === type) {
        queries.push({propertyKey: key, selector: functionName(meta.selector)});
      }
    });

  return queries;
};
