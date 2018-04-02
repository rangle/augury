import * as Dependencies from '../feature-support/dependencies';
import * as Modules from '../feature-support/modules';
import { AngularReaderService } from '../AngularReader.class';

class V502
  extends AngularReaderService
  implements Dependencies.DependencySupport,
             Modules.ModuleSupport {

  version = '5.0.2';

  hasDependencySupport: true = true;
  extractDependencies = Dependencies.extractDependenciesUsingUnstableMethod;
  extractParameterTypes = Dependencies.extractParameterTypesFromReflectMetadata;
  extractParameterDecorators = Dependencies.extractParameterDecoratorsFromUnderscoredProperty;

  hasModuleSupport: true = true;
  extractNgModuleDecoratorConfig = Modules.extractNGModuleDecoratorConfigFromDecoratorsProperty;

}

export default ( new V502() );
