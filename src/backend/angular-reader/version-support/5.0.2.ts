import { Dependency, DependencySupport, extractDependenciesUsingUnstableMethod } from '../readers/dependencies'
import { AngularReaderService } from '../readers/AngularReader.interface'

class V502
  extends AngularReaderService
  implements DependencySupport {
  version = '5.0.2'
  hasDependencySupport: true = true
  extractDependencies = extractDependenciesUsingUnstableMethod
}

export default ( new V502() )
