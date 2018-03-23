// 3rd party deps
import semver from 'semver';

// same module deps
import { readVersion } from './readVersion.function';
import { Registry } from './version-support/registry';

export const generateAngularReader = () => {
  const v = readVersion();
  const currentVersion = {
    raw: v,
    valid: semver.valid(v),
    clean: semver.clean(semver.coerce(v))
  };

  // precondition: all versions are different
  // sort in "reverse" order: last version will override previous versions
  const sortedRegistry = Registry.sort((a, b) => {

    // if one of them is exactly the current, it goes last
    if (semver.eq(a.version, currentVersion.clean)) return -1;
    if (semver.eq(b.version, currentVersion.clean)) return 1;

    if (semver.lt(a.version, currentVersion.clean)) {
      // if a is less than current, and b is not, then b comes first
      if (!semver.lt(b.version, currentVersion.clean)) return 1;
      // both are smaller than current
      else {
        if (semver.lt(a.version, b.version)) return 1;
        else return -1;
      }
    }

    // a is bigger than current
    else {
      // if a is greater than current, and b is not, then a comes first
      if (!semver.gt(b.version, currentVersion.clean)) return -1
      else {
        if (semver.gt(a.version, b.version)) return 1;
        else return -1
      }
    }

  });
}
