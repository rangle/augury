import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../utils/parse-modules';
import {functionName} from '../../../utils';

export interface DependencySupport {
  // support flag
  hasDependencySupport: true
  extractDependencies(instance:any):Array<Dependency> //@todo: instance type
}

export interface Dependency {
  id: string;
  name: string;
  decorators: Array<string>;
}

//@todo: change name
export const extractDependenciesUsingUnstableMethod = (instance): Array<Dependency> => {
  const parameterDecorators = extractInjectedParameterDecorators(instance);
  const normalizedParamTypes = parameterDecorators
    ? extractParameterTypes(instance).map((type, i) => type
      ? type
      : parameterDecorators[i].find(item => item.token !== undefined).token )
    : [];

  return normalizedParamTypes.map((paramType, i) => ({
    id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, paramType),
    name: functionName(paramType) || paramType.toString(),
    decorators: parameterDecorators[i] ? parameterDecorators[i].map(d => d.toString()) : [],
  }));
};


/**
 *
 */
export const extractInjectedParameterDecorators = (instance): Array<any> => {
  return Reflect.getOwnMetadata('parameters', instance.constructor)
      || instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
}


export const extractParameterTypes = (instance): Array<any> => {
  return Reflect.getOwnMetadata('design:paramtypes', instance.constructor)
    .map(param => param.name === 'Object' ? null : param);
}
