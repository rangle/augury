import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules';
import {functionName} from '../../../../utils';

// ---- FEATURE SUPPORT DEPENDENCIES

import { BasicDecoratorsSupport } from '../basic-decorators'

// ----  FEATURE DATA TYPES

/**
 *  represents a Dependency Injection "Dependency".
 *  so, the things enumerated in the (component, service, etc)'s constructor
 */
export interface Dependency {
  id: string;
  name: string;
  decorators: Array<string>;
}

// @todo: what is this? type it.
export type ParameterType = any;

// @todo: what is this? type it.
export type ParameterDecorator = any;

// ----- FEATURE SUPPORT

export interface DependencySupport extends BasicDecoratorsSupport {

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
