// 3rd party deps
import * as semver from 'semver';

// same module deps
import { readVersion } from './readVersion.function';
import { Registry } from './version-support/registry';

import { AngularReaderService } from './readers/AngularReader.interface'

export const generateAngularReader = (): AngularReaderService => {
  const v = readVersion();
  const targetVersion = {
    raw: v,
    valid: semver.valid(v),
    clean: semver.clean(v)
  };

  return findBestMatchForVersion(targetVersion.clean, Registry);
}

const findBestMatchForVersion = (targetVersion:string, registry: Array<AngularReaderService>): AngularReaderService => {
  // precondition: all versions are different
  // sort in "reverse" order: last version will override previous versions
  const sortedRegistry: Array<AngularReaderService> = registry.sort((a, b) => {

    // if one of them is exactly the current, it goes last
    if (semver.eq(a.version, targetVersion)) return 1;
    if (semver.eq(b.version, targetVersion)) return -1;

    if (semver.lt(a.version, targetVersion)) {
      // if a is less than current, and b is not, then b comes first
      if (!semver.lt(b.version, targetVersion)) return -1;
      // both are smaller than current
      else {
        if (semver.lt(a.version, b.version)) return -1;
        else return 1;
      }
    }

    // a is bigger than current
    else {
      // if a is greater than current, and b is not, then a comes first
      if (!semver.gt(b.version, targetVersion)) return 1
      else {
        if (semver.gt(a.version, b.version)) return -1;
        else return 1
      }
    }

  })

  return sortedRegistry[sortedRegistry.length - 1]
}
