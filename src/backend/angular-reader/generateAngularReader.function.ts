// 3rd party deps
import * as semver from 'semver';

// same module deps
import { readVersion } from './readVersion.function';
import { REGISTRY } from './version-support/registry';

import { AngularReaderService } from './AngularReader.class';

export const generateAngularReader = (): AngularReaderService => {
  const v = readVersion();
  const targetVersion = {
    raw: v,
    valid: semver.valid(v),
    clean: semver.clean(v)
  };

  const s = findBestMatchForVersion(targetVersion.clean, REGISTRY);
  console.log(`your version: ${targetVersion.clean} | best match: ${s.version}`);
  return s;
};

// @todo: redo this. it works for now but theres no need to sort like this.
//        this was made when we were planning to do a waterfall merge of all version support modules.
//        now this function just needs to return the single module that best fits the target version
const findBestMatchForVersion
  = (targetVersion: string, registry: Array<AngularReaderService>): AngularReaderService => {
  // precondition: all versions are different
  // sort in "reverse" order: last version is our selection
  const sortedRegistry: Array<AngularReaderService> = registry.sort((a, b) => {

    // if one of them is exactly the targget, it goes "last" (our selection)
    if (semver.eq(a.version, targetVersion)) { return 1; }
    if (semver.eq(b.version, targetVersion)) { return -1; }

    // a is smaller than target
    if (semver.lt(a.version, targetVersion)) {
      // if a is less than target, and b is not, then b comes first
      if (!semver.lt(b.version, targetVersion)) { return -1; }
      // both are smaller than target
      else {
        if (semver.lt(a.version, b.version)) { return -1; }
        else { return 1; }
      }
    }

    // a is bigger than target
    else {
      // if a is greater than targget, and b is not, then a comes first
      if (!semver.gt(b.version, targetVersion)) { return 1; }
      else {
        if (semver.gt(a.version, b.version)) { return -1; }
        else { return 1; }
      }
    }

  });

  return sortedRegistry[sortedRegistry.length - 1];
};
