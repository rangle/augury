import {
  Message,
  MessageType,
  deserializeMessage,
} from '../communication';

import * as Raven from 'raven-js';

import { buildConfig } from '../build.config';

declare const SENTRY_KEY: string;

const sentryConfig = buildConfig.sentry;

if ( sentryConfig.enabled
  && sentryConfig.key
  && sentryConfig.key.length  > 0
) {

  Raven
    .config(SENTRY_KEY, { release: chrome.runtime.getManifest().version })
    .install();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.messageType === MessageType.SendUncaughtError) {
      deserializeMessage(message);
      reportError(message.content);
    }
  });

  const reportError = (errMsg) => {
    const e = new Error(errMsg.error.message);
    e.name = errMsg.error.name;
    e.stack = errMsg.error.stack;
    Raven.captureException(e, {
      tags: {
        ngVersion: errMsg.ngVersion,
      },
    });
  };

}
