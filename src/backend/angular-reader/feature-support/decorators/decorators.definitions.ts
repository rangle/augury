
// ----  FEATURE DATA TYPES

/**
 *  represents a Dependency Injection "Dependency".
 *  so, the things enumerated in the (component, service, etc)'s constructor
 */
// @todo: do we extend a general decorator interface?
export interface ComponentDecorator {
  changeDetection: boolean; // @todo: this is an enum type. this is always here.
  selector: string; // @todo: this seems to be always here for components

  // @todo: what to do with this?
  //        it's a lot to pass around and store.
  //        but useful for template debugging.
  // template: string;

  // @todo: does this come in other forms?
  //        this does not count inputs set with property decorators
  // @example: kitchen-sink/metadata-test
  inputs?: Array<string>;
  outputs?: Array<string>;

  ngMetadataName: 'Component'; // this seems to be true for all components
}

// ----- FEATURE SUPPORT

export interface DependencySupport {
  // support flag
  hasDependencySupport: true;
  extractDependencies: ExtractDependenciesFunction; //@todo: instance type
  extractParameterTypes: ExtractParameterTypesFunction;
  extractParameterDecorators: ExtractParameterDecoratorsFunction;
}

// ----  FEATURE FUNCTIONS

export type ExtractDependenciesFunction = (instance: any) => Array<Dependency>;
export type ExtractParameterTypesFunction = (instance: any) => Array<ParameterType>;
export type ExtractParameterDecoratorsFunction = (instance: any) => Array<ParameterDecorator>;
