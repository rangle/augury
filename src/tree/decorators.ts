import {
  InputProperty,
  OutputProperty,
} from './node';

import {functionName} from '../utils';

import { diagnosable } from '../diagnostic-tools/backend/decorator';

export const classDecorators = (token): Array<any> =>
  Reflect.getOwnMetadata('annotations', token) || [];

export const propertyDecorators = (instance): Array<any> =>
  Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];

export const parameterTypes = (instance): Array<any> =>
  Reflect.getOwnMetadata('design:paramtypes', instance.constructor)
  .map(param => param.name == 'Object' ? null : param);

export const injectedParameterDecorators: (instance: any) => Array<any>
  = diagnosable({
    name: 'injectedParameterDecorators',
    deps: [ 'parameterTypes (decorators.ts)' ],
    pre: s => (instance) => {
      s.remember({ instance });
    },
    post: s => (result: Array<any>) => {
      const pt = parameterTypes(s.old('instance'));
      const matchPt = s.assert(
        `resulting array exists if and only if
          \`parameterTypes(instance)\` also exists
          and contains no null entries (which correspond to decorated parameters)`,
            (result && pt && pt.some(i => i === null))
         || (!result && ( !pt || !pt.some(i => i === null) ))
      );
      if (result) {
        s.assert(`resulting array has same length as \`parameterTypes(instance)\``,
          result.length === pt.length );
        s.assert('resulting array items are null except for maybe arrays containing object with token',
          result.every(item =>
            item === null
            || (
              Array.isArray(item)
              && item.find(i => i !== null && typeof i === 'object' && i.token)
            )
          ));
        s.assert(`non-null array items match up with \`parameterTypes(instance)\` null items`,
          result.every((item, i) =>
            (item !== null)
            ? pt[i] === null
            : true
          ));
      }
      s.inspect({
        className: s.old('instance').constructor.name,
        result: result || 'undefined',
        parameterTypes: pt || 'undefined'
      }); // @todo: improve stringify to print undefined. currently it omits
      // if(s.old('instance').constructor.name == 'Component4') debugger;
    }
  })(instance => {
    return instance.constructor.__parameters__
        || instance.constructor.__paramaters__; // angular 5.1 has a typo
  });

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
