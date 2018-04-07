import * as BasicDecorators from '../feature-support/basic-decorators';
import * as Dependencies from '../feature-support/dependencies';
import * as Modules from '../feature-support/modules';
import { AngularReaderService } from '../AngularReader.class';

class V502
  extends AngularReaderService
  implements BasicDecorators.BasicDecoratorsSupport,
             Dependencies.DependencySupport,
             Modules.ModuleSupport {

  version = '5.0.2';

  hasBasicDecoratorSupport: true = true;
  extractDecoratorsForClass = BasicDecorators.extractDecoratorsForClassUsingNgMetadataName;
  extractComponentDecorator = BasicDecorators.extractComponentDecoratorUsingNgMetadataName;
  extractDecoratorsForParameters = BasicDecorators.extractDecoratorsForParametersFromUnderscoredProperty;

  hasDependencySupport: true = true;
  extractDependencies = Dependencies.extractDependenciesByMergingParamTypesAndDependencies;
  extractParameterTypes = Dependencies.extractParameterTypesFromReflectMetadata;

  hasModuleSupport: true = true;
  extractNgModuleDecoratorConfig = Modules.extractNGModuleDecoratorConfigFromDecoratorsProperty;

}

export default ( new V502() );
