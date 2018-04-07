import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules'; // @todo: what's this?
import {functionName} from '../../../../utils'; // @todo: this is fine, but fix pathing

import {
  extractDecoratorsForParametersFromUnderscoredProperty,
  DecoratorsForParameters,
  ParameterDecorators,
  ParameterDecorator,
  isInject,
  isForwardRef,
  InjectDecorator,
} from '../basic-decorators'

import {
  Dependency,
  ParameterType,
  ExtractDependenciesFunction,
  ExtractParameterTypesFunction,
  UNKNOWN_PARAM_TYPE,
} from './dependencies.definitions';

/**
 *
 */
export const extractDependenciesByMergingParamTypesAndDependencies: ExtractDependenciesFunction
  = (instance): Array<Dependency> => {
    return dependenciesFromParameterTypesAndDecoratorsForParameters(
      extractParameterTypesFromReflectMetadata(instance),
      extractDecoratorsForParametersFromUnderscoredProperty(instance)
    )
  };

/**
 *
 */
// Router and Component used as instance currently (at least)
export const extractParameterTypesFromReflectMetadata: ExtractParameterTypesFunction
  = (instance): Array<ParameterType | undefined> => {
    return (Reflect.getOwnMetadata('design:paramtypes', instance.constructor) || [])
      .map(param => typeof param !== 'function' || param.name === 'Object' ? undefined : param);
  };

// --- helpers

// precond: arrays same size
const dependenciesFromParameterTypesAndDecoratorsForParameters
  = ( parameterTypes: Array<ParameterType | undefined>,
      decoratorsForParameters: DecoratorsForParameters | undefined ): Array<Dependency>  => {

        const normalizedParamTypes: Array<ParameterType>
          = (new Array(parameterTypes.length))
              .fill(true)
              .map((_, parameterIndex: number) => {

                const paramType: ParameterType | undefined
                  = parameterTypes[parameterIndex];

                if (paramType) return paramType;

                if (!decoratorsForParameters) { return UNKNOWN_PARAM_TYPE; }

                const paramTypeFromDecorator: ParameterType | undefined
                  = tryToGetParamTypeFromDecorator(decoratorsForParameters, parameterIndex);

                if (!paramTypeFromDecorator) { return UNKNOWN_PARAM_TYPE; }

                return paramTypeFromDecorator;

              })

        return normalizedParamTypes
          .map((paramType, paramIndex) => {

            let decoratorNames: Array<string> = [];

            if (decoratorsForParameters) {

              const paramDecorators = decoratorsForParameters[paramIndex]

              if (paramDecorators) {
                decoratorNames = paramDecorators
                  .reduce((acc: Array<string>, cur: ParameterDecorator) =>
                    cur ? acc.concat([ cur.toString() ]) : acc, [])
              }

            }

            return {
              name: paramType.name,
              decorators: decoratorNames
            }
          })
      }


// --- helpers

const tryToGetParamTypeFromDecorator
  = (decoratorsForParameters: DecoratorsForParameters, parameterIndex: number): ParameterType | undefined => {
    const parameterDecorators: ParameterDecorators | undefined
      = decoratorsForParameters[parameterIndex];

    if (!parameterDecorators) { return undefined; }

    const injectDecorator = <InjectDecorator | undefined>
      parameterDecorators.find(pd => !!isInject(pd))

    if (!injectDecorator) { return undefined; }

    const token = injectDecorator.token

    if (isForwardRef(token)) {
      return { name: token.toString() } }
    else {
      return { name: token.name } }

  }
