import { DependencySupport } from './dependencies'

export class AngularReaderService {

  // angular version (semver)
  version: string //@todo: clean semver type?

  hasDependencySupport: boolean
  dependencySupport = (): DependencySupport => {
    if (!this.hasDependencySupport)
      throw new Error('no dependency support!')
    return this as any as DependencySupport
  }
}
