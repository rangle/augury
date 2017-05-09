import {
  subscribeToUncaughtExceptions,
} from '../utils/error-handling';

import * as Raven from 'raven-js';

declare const SENTRY_KEY: string;
if (SENTRY_KEY && SENTRY_KEY.length > 0) {
  Raven
    .config(SENTRY_KEY)
    .install();

  subscribeToUncaughtExceptions(err => {
    const e = new Error(err.name);
    e.message = err.message;
    e.stack = err.stack;
    Raven.captureException(e);
  });
}
