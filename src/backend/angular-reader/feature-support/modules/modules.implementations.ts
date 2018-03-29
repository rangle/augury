import { ExtractNGModuleDecoratorConfigFunction } from './modules.definitions';

// @todo: precondition: all ngModulesConstructors have a decorators property. (this is for angular 5)

export const extractNGModuleDecoratorConfigFromDecoratorsProperty: ExtractNGModuleDecoratorConfigFunction
  = (ngModuleConstructor: any) => {

    //@todo: whats the difference between decorators and __annotations__ ? why is it one or the other?
    if (ngModuleConstructor.decorators) {
      return ngModuleConstructor.decorators.reduce((prev, curr, idx, decorators) =>
        prev ?
          prev
        :
          (
            (decorators[idx].type.prototype.ngMetadataName === 'NgModule') ||
            (decorators[idx].type.prototype.toString() === '@NgModule')
          ) ?
            (decorators[idx].args || [])[0] || {}
          :
            null
      , null) || {};
    }

    //@todo: whats the difference between decorators and __annotations__ ? why is it one or the other?
    if (ngModuleConstructor.__annotations__) {
      return ngModuleConstructor.__annotations__.find(decorator => decorator.ngMetadataName === 'NgModule');
    }

    // @todo: enforce that return has all the properties of type (even if they have to be empty arrays or whatever
    return {}

  }
