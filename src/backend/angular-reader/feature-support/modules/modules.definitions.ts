
// ----  FEATURE DATA TYPES (augury types) // @todo: these should be separate ? (cause frontend will also use?)

/**
 *  legacy Augury datatype. (expand)
 */
export interface NgModulesRegistry {
  id: string;
  name: string;
  decorators: Array<string>;
}

// @todo: describe the types in each array (they shouldnt be angular things, but augury things)
/**
 *  describes the configurations passed to an @NgModule decorator
 */
export interface NgModuleDecoratorConfig {
  declarations: Array<any>; // these are constructor functions
  exports: Array<any>; // could be anything...
  providers: Array<any>; // seems like also constructor functions
  imports: Array<any>;
}

// ----- FEATURE SUPPORT

export interface ModuleSupport {
  // support flag
  hasModuleSupport: true
  extractNgModuleDecoratorConfig: ExtractNGModuleDecoratorConfigFunction //@todo: instance type
}

// ----  FEATURE FUNCTIONS

export type ExtractNGModuleDecoratorConfigFunction = (ngModuleConstructor:any) => NgModuleDecoratorConfig;
