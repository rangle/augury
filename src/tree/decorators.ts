import {
  InputProperty,
  OutputProperty,
} from './node';

import {functionName} from '../utils';

export const classDecorators = (token): Array<any> => {
  debugger;
  return Reflect.getOwnMetadata('annotations', token) || [];
}

export const propertyDecorators = (instance): Array<any> => {
  debugger;
  return Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];
}

export const parameterTypes = (instance): Array<any> => {
  debugger;
  return Reflect.getOwnMetadata('design:paramtypes', instance.constructor)
    .map(param => param.name === 'Object' ? null : param);
}

export const injectedParameterDecorators = (instance): Array<any> => {
  debugger;
  return Reflect.getOwnMetadata('parameters', instance.constructor)
      || instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
}

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

export const componentMetadata = (token) => {
  if (!token) {
    return null;
  }

  return classDecorators(token).find(d => d.toString() === '@Component');
};

export const componentInputs = (metadata, instance): Array<InputProperty> => {
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

export const componentOutputs = (metadata, instance): Array<OutputProperty> => {
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

export const componentQueryChildren = (type: string, metadata, instance): Array<Query> => {
  const queries = new Array<Query>();

  iteratePropertyDecorators(instance,
    (key: string, meta) => {
      if (meta.toString() === type) {
        queries.push({propertyKey: key, selector: functionName(meta.selector)});
      }
    });

  return queries;
};
