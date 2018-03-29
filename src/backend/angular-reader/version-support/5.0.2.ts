import { DependencySupport, extractDependenciesUsingUnstableMethod } from '../feature-support/dependencies'
import { ModuleSupport, extractNGModuleDecoratorConfigFromDecoratorsProperty } from '../feature-support/modules'
import { AngularReaderService } from '../AngularReader.class'

class V502
  extends AngularReaderService
  implements DependencySupport,
             ModuleSupport {

  version = '5.0.2'

  hasDependencySupport: true = true
  extractDependencies = extractDependenciesUsingUnstableMethod

  hasModuleSupport: true = true
  extractNgModuleDecoratorConfig = extractNGModuleDecoratorConfigFromDecoratorsProperty

}

export default ( new V502() )
