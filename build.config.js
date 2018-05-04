/**
 *  BUILD MODE (prod / dev)
 *  output: env.PROD_MODE
 */

const isDevelopment = () =>
  process.env.NODE_ENV === 'development';

const isProduction = () => !isDevelopment()

const prodModeEntry = isProduction()

// ------

/**
 * TARGET BUILD (these configs will turn features on/off, and produce different manifests)
 * CROSS-BROWSER COMPATIBILITY (and other builds)
 * We use different build configurations depending on browser (or other builds, like canary).
 *    For example, browsers have different support for properties on manifest.json
 * We also inject environment variables into the code, to toggle feature support.
 *    [see src/build.ts]
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

 const targetEntry = getTargetBuildName()
 const buildEntries = BUILD[getTargetBuildName()]

// ------

/**
 * ENTRIES (environment values for build)
 */

 /**
  * This is a map of strings to primitives
  *   representing the environment variables for the build.
  */
 const entries = {
   PROD_MODE: prodModeEntry,
   TARGET: targetEntry,
   ...buildEntries,
 };

const getEntries = () => entries

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

// ------

module.exports = {
  entries: getEntries,
  manifestFiles: getManifestFiles,
}
