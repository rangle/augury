import { merge } from 'ramda'

import {
  ExtractClassDecoratorsFunction,
  ExtractComponentDecoratorFunction,
  ClassDecorator,
  ClassDecoratorType,
  ComponentDecorator,
} from './basic-decorators.definitions'

const ngMetadataNames = {
  Component: 'Component'
}

export const extractClassDecoratorsUsingNgMetadataName: ExtractClassDecoratorsFunction
  = (constructor: any): Array<ClassDecorator> => {
    const raw: Array<any> = constructor.__annotations__ || [];
    return raw.map(rawClassDecorator =>
      merge(rawClassDecorator, {
        classDecoratorType: determineClassDecoratorTypeFromNgMetadataName(rawClassDecorator)
      }))
  };

export const extractComponentDecoratorUsingNgMetadataName: ExtractComponentDecoratorFunction
  = (componentConstructor: any): ComponentDecorator | undefined => {
    return <ComponentDecorator> extractClassDecoratorsUsingNgMetadataName(componentConstructor)
      .find((classDecorator: ClassDecorator) =>
        classDecorator.classDecoratorType === ClassDecoratorType.Component )
  }
  
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
    }
  }