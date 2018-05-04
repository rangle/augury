
// expected injected enviornment variables
declare const GTM: any;
declare const SENTRY: any;
declare const PROD_MODE: any;

interface BuildConfig {
  enableGoogleTagManager: boolean;
  enableSentry: boolean;
  PROD_MODE: boolean;
}

const BUILD: BuildConfig = {
  enableGoogleTagManager: Boolean(parse(GTM)),
  enableSentry: Boolean(parse(SENTRY)),
  PROD_MODE: Boolean(parse(PROD_MODE)),
};

function parse(stringified) {
  return JSON.parse(stringified || null);
}

export default BUILD;
