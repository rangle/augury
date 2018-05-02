/**
 *  BUILD MODE (prod / dev)
 *  [process.env.NODE_ENV]
 */

const isDevelopment = () =>
  process.env.NODE_ENV === 'development';

const isProduction = () => !isDevelopment()

// ------

/**
 * TARGET BUILD (these configs will turn features on/off, and produce different manifests)
 * [process.env.BUILD]
 */

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

// ------

/**
 * INJECTABLES (config values accessible from src code)
 */

// these are what gets injected into the source code
// should be simple primitives as values.
// output should match type defined in `src/build.ts`
const getInjectables = () =>
  Object.assign({},
    BUILD[getTargetBuildName()], // target build options
    { PROD_MODE: isProduction() }) // prod flag

// ------

/**
 *  MANIFEST FILES (these are merged together to generate final `manifest.json`
 */

const getManifestFiles = () =>
  [
    // base manifest file
    'manifest/base.manifest.json',
    // each build can extend the base manifest with a file of this form
    `manifest/${getTargetBuildName().toLowerCase()}.manifest.json`,
  ]

module.exports = { isProduction, getInjectables, getManifestFiles, getTargetBuildName }
