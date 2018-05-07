
// expected injected environment variables
//   declared in `/build.config.js`
//   injected via DefinePlugin in `/webpack.config.js`
declare const GTM_ENABLED: any;
declare const SENTRY_ENABLED: any;
declare const SENTRY_KEY: any;
declare const PROD_MODE: any;

interface BuildConfig {

  sentry: {
    enabled: boolean;
    key: string | undefined;
  };

  googleTagManager: {
    enabled: boolean;
  };

  prodMode: boolean;

}

export const buildConfig: BuildConfig = {

  googleTagManager: {
    enabled: Boolean(GTM_ENABLED),
  },

  sentry: {
    enabled: Boolean(SENTRY_ENABLED),
    key: SENTRY_KEY ? String(SENTRY_KEY) : undefined
  },

  prodMode: Boolean(PROD_MODE),

};
