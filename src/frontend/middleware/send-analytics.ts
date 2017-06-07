import {Injectable} from '@angular/core';
import {MainActions} from '../actions/main-actions';
import {Options} from '../state';
import {AnalyticsConsent} from '../../options';
import {MessageFactory} from '../../communication';

@Injectable()
export class SendAnalytics {
  constructor(private options: Options) {}

  middleware = store => next => action => {
    if (action.type === MainActions.SEND_ANALYTICS &&
      this.options.analyticsConsent === AnalyticsConsent.Yes) {
      chrome.runtime.sendMessage(MessageFactory.analyticsEvent(
        action.payload.event,
        action.payload.desc));
    }
    return next(action);
  }
}
