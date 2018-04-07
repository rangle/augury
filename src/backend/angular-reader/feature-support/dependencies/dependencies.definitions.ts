import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules';
import {functionName} from '../../../../utils';

// ---- FEATURE SUPPORT DEPENDENCIES

import { BasicDecoratorsSupport } from '../basic-decorators'

// ----  FEATURE DATA TYPES

/**
 *  represents a Dependency Injection "Dependency".
 *  so, the things enumerated in the (component, service, etc)'s constructor
 *  (this is a legacy augury type that is used throughout)
 */
export interface Dependency {
  // id: string; // what is this for???
  name: string;
  decorators: Array<string>;
}

/**
 *  represents a Dependency Injection "type",
 *    aka a constructor function (class)
 */
export interface ParameterType {
  name: string
}

export const UNKNOWN_PARAM_TYPE: ParameterType = { name: '[unknown]' }

// @todo: what is this? type it.
export type ParameterDecorator = any;

// ----- FEATURE SUPPORT

export interface DependencySupport extends BasicDecoratorsSupport {

  // support flag
  hasDependencySupport: true;

  extractDependencies: ExtractDependenciesFunction; //@todo: instance type
  extractParameterTypes: ExtractParameterTypesFunction;

}

// ----  FEATURE FUNCTIONS

export type ExtractDependenciesFunction = (instance: any) => Array<Dependency>;
export type ExtractParameterTypesFunction = (instance: any) => Array<ParameterType | undefined>;
