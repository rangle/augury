import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules'; //@todo: what's this?
import {functionName} from '../../../../utils'; // @todo: this is fine, but fix pathing

import { ExtractDependenciesFunction } from './dependencies.definitions';

//@todo: change name
export const extractDependenciesUsingUnstableMethod: ExtractDependenciesFunction
  = (instance) => {

    const parameterDecorators = extractParameterDecorators(instance) || [];
    const normalizedParamTypes = extractParameterTypes(instance)
      .map((type, i) => type ?
          type
        : Array.isArray(parameterDecorators[i]) ?
            (() => {
              const decoratorToken = parameterDecorators[i].find(item => item.token !== undefined);
              return decoratorToken ? decoratorToken.token : 'unknown';
            })()
          : 'unknown'
      );

      if(normalizedParamTypes.length) {
        console.log(true);
      }

    return normalizedParamTypes.map((paramType, i) => ({
      id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, paramType),
      name: functionName(paramType) || paramType.toString(),
      decorators: parameterDecorators[i] ? parameterDecorators[i].map(d => d.toString()) : [],
    }));

  };


// ---- HELPERS

/**
 *
 */
const extractParameterDecorators = (instance): Array<any> => {
  return Reflect.getOwnMetadata('parameters', instance.constructor)
      || instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
}

/**
 *
 */
const extractParameterTypes = (instance): Array<any> => {
  return (Reflect.getOwnMetadata('design:paramtypes', instance.constructor) || [])
    .map(param => typeof param !== 'function' || param.name === 'Object' ? null : param);
}
