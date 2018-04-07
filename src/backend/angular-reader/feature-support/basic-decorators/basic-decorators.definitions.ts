
// ----  FEATURE DATA TYPES

// -- class decorators

export enum ClassDecoratorType {
  Component,
  Other
}

export interface ClassDecorator {
  classDecoratorType: ClassDecoratorType
}

export interface ComponentDecorator extends ClassDecorator {

  classDecoratorType: ClassDecoratorType.Component;

  changeDetection: boolean; // @todo: this is an enum type. this is always here.
  selector: string; // @todo: this seems to be always here for components

  // @todo: what to do with this?
  //        it's a lot to pass around and store.
  //        but useful for template debugging.
  // template: string;

  // this does not count inputs set with property decorators
  // @example: kitchen-sink/metadata-test
  inputs?: Array<string>;
  outputs?: Array<string>;

}

// -- parameter decorators

export enum ParameterDecoratorType {
  Inject,
  Other
}

export type ParameterDecorator
  = InjectDecorator
  | OtherDecorator;

interface BaseParameterDecorator {
  parameterDecoratorType: ParameterDecoratorType;
  toString: () => string;
}

export interface InjectDecorator extends BaseParameterDecorator {
  parameterDecoratorType: ParameterDecoratorType.Inject;
  token: InjectDecoratorToken;
}

export const isInject =
  (parameterDecorator: ParameterDecorator):
    parameterDecorator is InjectDecorator =>
      (<InjectDecorator> parameterDecorator).parameterDecoratorType
        === ParameterDecoratorType.Inject

export interface OtherDecorator extends BaseParameterDecorator  {
  parameterDecoratorType: ParameterDecoratorType.Other;
}

export const isOther =
  (parameterDecorator: ParameterDecorator):
    parameterDecorator is OtherDecorator =>
      !isInject(parameterDecorator)

// --- decorator tokens

export type InjectDecoratorToken
  = InjectDecoratorTokenWithForwardRef
  | InjectDecoratorTokenWithoutForwardRef;

export interface InjectDecoratorTokenWithForwardRef {
  isForwardRef: true;
  toString: () => string;
}

export const isForwardRef =
  (injectDecoratorToken: InjectDecoratorToken):
    injectDecoratorToken is InjectDecoratorTokenWithForwardRef =>
      (<InjectDecoratorTokenWithForwardRef> injectDecoratorToken).isForwardRef

export interface InjectDecoratorTokenWithoutForwardRef {
  isForwardRef: false;
  name: string;
}

export const isNotForwardRef =
  (injectDecoratorToken: InjectDecoratorToken):
    injectDecoratorToken is InjectDecoratorTokenWithoutForwardRef =>
      ! isForwardRef(injectDecoratorToken)

/**
 *  array of decorators for a parameter
 */
export type ParameterDecorators = Array<ParameterDecorator>

/**
 * array of decorators for each parameter in order
 *  (this is pretty much the way angular provides them)
 *  parameters without decorators will have null.
 */
export type DecoratorsForParameters = Array<ParameterDecorators | undefined>

// ----- FEATURE SUPPORT

export interface BasicDecoratorsSupport {

  // support flag
  hasBasicDecoratorSupport: true;

  extractDecoratorsForClass: ExtractDecoratorsForClassFunction;
  extractComponentDecorator: ExtractComponentDecoratorFunction;
  extractDecoratorsForParameters: ExtractDecoratorsForParametersFunction;

}

// ----  FEATURE FUNCTIONS

export type ExtractDecoratorsForClassFunction = (constructor: any) => Array<ClassDecorator>;
export type ExtractComponentDecoratorFunction = (componentConstructor: any) => ComponentDecorator | undefined;

/**
 * if none of the parameters have decorators, null is returned.
 *  otherwise if at least 1 parameter has a decorator, ParameterDecorators type is returned
 */
export type ExtractDecoratorsForParametersFunction = (constructor: any) => DecoratorsForParameters | undefined;
