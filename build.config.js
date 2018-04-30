
/**
 * CROSS-BROWSER COMPATIBILITY (and other builds)
 * We use different build configurations depending on browser (or other builds, like canary).
 * For example, browsers have different support for properties on manifest.json
 */

/**
 * Each build is defined with a set of boolean flags representing
 *   features that can be turned on and off. These configs are available to the
 *   source code as an injected global. (see src/build.config.ts)
 * Note that because DefinePlugin does a direct text replacement, in the case of strings,
 *   the value given to it must include actual quotes inside of the string itself.
 *   Typically, this is done either with either alternate quotes, such as '"production"',
 *   or by using JSON.stringify('production').
 *   Otherwise, the injected value will be `chrome` as an identifier rather than as a
 *   string, causing a "chrome is not defined" error.
 */
// versions we produce
const BUILD = {
  FIREFOX: {
    GTM: false, // google tag manager
    SENTRY: false, // remote error logging service
  },
  CHROME: {
    GTM: true,
    SENTRY: true,
  },
  CANARY: {
    GTM: false,
    SENTRY: true,
  },
}

// grab target build parameter (passed as command arg)
const getBuildRequestRaw = () =>
  process.env.BUILD || ''

// target BUILD parameter is case insensitive (default chrome)
const getTargetBuildName = () =>
  Object.keys(BUILD)
    .find(buildName => buildName == getBuildRequestRaw().toUpperCase())
  || 'CHROME'

const getTargetBuildConfig = () =>
  Object.assign({},
    BUILD[getTargetBuildName()],
    { _name: JSON.stringify(getTargetBuildName())})

const getTargetBuildManifestFiles = () =>
  [
    // base manifest file
    'manifest/base.manifest.json',
    // each build can extend the base manifest with a file of this form
    `manifest/${getTargetBuildName().toLowerCase()}.manifest.json`,
  ]

module.exports = { getTargetBuildName, getTargetBuildConfig, getTargetBuildManifestFiles }
