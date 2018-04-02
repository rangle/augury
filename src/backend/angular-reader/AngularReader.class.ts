import { DependencySupport } from './feature-support/dependencies';
import { ModuleSupport } from './feature-support/modules';

export class AngularReaderService {

  // angular version (semver)
  version: string; // @todo: clean semver type?

  as = <FeatureSupport>(): FeatureSupport =>
    this as any as FeatureSupport

  check = (featureName: string): boolean =>
    !this[`has${featureName}Support`] ? (() => {
      throw new Error(`unsupported feature expected: ${featureName}`);
    })() : true

  hasDependencySupport: boolean;
  dependencySupport = (): DependencySupport =>
    this.check('Dependency') && this.as<DependencySupport>()

  hasModuleSupport: boolean;
  moduleSupport = (): ModuleSupport =>
    this.check('Module') && this.as<ModuleSupport>()

}
