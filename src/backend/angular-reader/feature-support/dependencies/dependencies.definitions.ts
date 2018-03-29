import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../../utils/parse-modules';
import {functionName} from '../../../../utils';

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

// ----- FEATURE SUPPORT

export interface DependencySupport {
  // support flag
  hasDependencySupport: true
  extractDependencies:ExtractDependenciesFunction //@todo: instance type
}

// ----  FEATURE FUNCTIONS

export type ExtractDependenciesFunction = (instance:any) => Array<Dependency>;
