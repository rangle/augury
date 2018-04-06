
// ----  FEATURE DATA TYPES

// -- class decorators

export enum ClassDecoratorType {
  Component
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

export interface ParameterDecorator {
  
}

// ----- FEATURE SUPPORT

export interface BasicDecoratorsSupport {

  // support flag
  hasBasicDecoratorSupport: true;

  extractDecoratorsForClass: ExtractDecoratorsForClassFunction;
  extractComponentDecorator: ExtractComponentDecoratorFunction;
  extractDecoratorsForParameter: ExtractDecoratorsForParameterFunction

}

// ----  FEATURE FUNCTIONS

export type ExtractDecoratorsForClassFunction = (constructor: any) => Array<ClassDecorator>;
export type ExtractComponentDecoratorFunction = (componentConstructor: any) => ComponentDecorator;
export type ExtractDecoratorsForParameterFunction = (constructor: any) => Array<ParameterDecorator>;
