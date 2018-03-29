import {AUGURY_TOKEN_ID_METADATA_KEY} from '../../utils/parse-modules';
import {functionName} from '../../../utils';

export type ExtractDependenciesFunction = (instance) => boolean;

export interface DependencySupport {
  // support flag
  hasDependencySupport: true
  extractDependencies(instance:any):Array<Dependency> //@todo: instance type
}

export interface Dependency {
  id: string;
  name: string;
  decorators: Array<string>;
}
