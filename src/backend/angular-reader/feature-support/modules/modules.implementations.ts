import { ExtractNGModuleDecoratorConfigFunction, NgModuleDecoratorConfig  } from './modules.definitions';

// @todo: precondition: all ngModulesConstructors have a decorators property. (this is for angular 5)

export const extractNGModuleDecoratorConfigFromDecoratorsProperty: ExtractNGModuleDecoratorConfigFunction
  = (ngModuleConstructor: any): NgModuleDecoratorConfig => {

    const baseType: NgModuleDecoratorConfig = {
      declarations: [],
      exports: [],
      providers: [],
      imports: []
    };

    let extracts = {};

    // @todo: whats the difference between decorators and __annotations__ ? why is it one or the other?
    if (ngModuleConstructor.decorators) {
      extracts = ngModuleConstructor.decorators.reduce((prev, curr, idx, decorators) =>
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

    // @todo: whats the difference between decorators and __annotations__ ? why is it one or the other?
    if (ngModuleConstructor.__annotations__) {
      extracts = ngModuleConstructor.__annotations__.find(decorator => decorator.ngMetadataName === 'NgModule');
    }

    return Object.assign({}, baseType, extracts);

  };
