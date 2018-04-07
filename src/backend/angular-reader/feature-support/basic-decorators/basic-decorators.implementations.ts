import { merge } from 'ramda'

import {
  ExtractDecoratorsForClassFunction,
  ExtractDecoratorsForParametersFunction,
  ExtractComponentDecoratorFunction,
  ClassDecorator,
  ClassDecoratorType,
  ComponentDecorator,
  ParameterDecoratorType,
  ParameterDecorator,
  InjectDecorator,
  InjectDecoratorTokenWithForwardRef,
  InjectDecoratorTokenWithoutForwardRef,
  ParameterDecorators,
  DecoratorsForParameters,
} from './basic-decorators.definitions'

const ngMetadataNames = {
  Component: 'Component',
  Inject: 'Inject',
}

export const extractDecoratorsForClassUsingNgMetadataName: ExtractDecoratorsForClassFunction
  = (constructor: any): Array<ClassDecorator> => {
    const raw: Array<any> = constructor.__annotations__ || [];
    return raw.map(rawClassDecorator =>
      merge(rawClassDecorator, {
        classDecoratorType: determineClassDecoratorTypeFromNgMetadataName(rawClassDecorator) }))
  };

export const extractComponentDecoratorUsingNgMetadataName: ExtractComponentDecoratorFunction
  = (componentConstructor: any): ComponentDecorator | undefined => {
    return <ComponentDecorator> extractDecoratorsForClassUsingNgMetadataName(componentConstructor)
      .find((classDecorator: ClassDecorator) =>
        classDecorator.classDecoratorType === ClassDecoratorType.Component )
  }


export const extractDecoratorsForParametersFromUnderscoredProperty: ExtractDecoratorsForParametersFunction
  = (instance): DecoratorsForParameters | undefined => {
    const rawDecoratorsForParameters:any =
         instance.constructor.__parameters__
      || instance.constructor.__paramaters__; // angular 5.1 has a typo
    if (!Array.isArray(rawDecoratorsForParameters)) return undefined;
    return rawDecoratorsForParameters
      .map(rawParameterDecorators => rawParameterDecorators ?
          rawParameterDecorators
            .map(rawParameterDecorator =>
              merge(rawParameterDecorator, {
                parameterDecoratorType: determineParameterDecoratorTypeFromNgMetadataName(rawParameterDecorator) }))
        : undefined )
  };

/*
export const propertyDecorators = (instance): Array<any> => {
//  debugger;
  return Reflect.getOwnMetadata('propMetadata', instance.constructor) || [];
};*/

// --- helpers

const determineClassDecoratorTypeFromNgMetadataName =
  (rawClassDecorator: any): ClassDecoratorType => {
    switch (rawClassDecorator) {
      case ngMetadataNames.Component: return ClassDecoratorType.Component
      default: return ClassDecoratorType.Other
    }
  }

const determineParameterDecoratorTypeFromNgMetadataName =
  (rawParameterDecorator: any): ParameterDecoratorType => {
    switch (rawParameterDecorator.ngMetadataName) {
      case ngMetadataNames.Inject: return ParameterDecoratorType.Inject
      default: return ParameterDecoratorType.Other
    }
  }
