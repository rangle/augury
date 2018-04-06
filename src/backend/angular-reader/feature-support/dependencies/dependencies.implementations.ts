import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules'; // @todo: what's this?
import {functionName} from '../../../../utils'; // @todo: this is fine, but fix pathing

import * as BasicDecorators from '../basic-decorators'

import {
  Dependency,
  ParameterType,
  ParameterDecorator,
  ExtractDependenciesFunction,
  ExtractParameterTypesFunction
} from './dependencies.definitions';

// @todo: change name
export const extractDependenciesUsingUnstableMethod: ExtractDependenciesFunction
  = (instance): Array<Dependency> => {

    const parameterDecorators = BasicDecorators.extractDecoratorsForParametersFromUnderscoredProperty(instance) || [];
    const normalizedParamTypes = extractParameterTypesFromReflectMetadata(instance)
      .map((type, i) => type ?
          type
        : Array.isArray(parameterDecorators[i]) ?
            (() => {
              const decoratorToken = parameterDecorators[i].find(item => item.token !== undefined);
              return decoratorToken ? decoratorToken.token : 'unknown';
            })()
          : 'unknown'
      );

      if (normalizedParamTypes.length) {
        console.log(true);
      }

    return normalizedParamTypes.map((paramType, i) => ({
      id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, paramType),
      name: functionName(paramType) || paramType.toString(),
      decorators: parameterDecorators[i] ? parameterDecorators[i].map(d => d.toString()) : [],
    }));

  };

/**
 *
 */
// Router and Component used as instance currently (at least)
export const extractParameterTypesFromReflectMetadata: ExtractParameterTypesFunction
  = (instance): Array<ParameterType> => {
    return (Reflect.getOwnMetadata('design:paramtypes', instance.constructor) || [])
      .map(param => typeof param !== 'function' || param.name === 'Object' ? null : param);
  };
