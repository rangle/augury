import {Injectable} from '@angular/core';
import {MainActions} from '../actions/main-actions';
import {Options} from '../state';
import {AnalyticsConsent} from '../../options';
import GoogleTagManagerSend from '../../gtm';

@Injectable()
export class SendAnalytics {
  constructor(private options: Options) {}

  middleware = store => next => action => {
    if (action.type === MainActions.SEND_ANALYTICS &&
      this.options.analyticsConsent === AnalyticsConsent.Yes) {
      GoogleTagManagerSend({
        'event': action.payload.event,
        'desc': action.payload.desc
      });
    }
    return next(action);
  }
}
