
declare const INJECTED_BUILD_CONFIG: any;

interface BuildConfig {
  GTM: boolean;
  SENTRY: boolean;
  PROD_MODE: boolean;
}

export const BUILD: BuildConfig = INJECTED_BUILD_CONFIG
