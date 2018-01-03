import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  Options,
  AnalyticsConsent,
} from '../../state';

@Component({
  selector: 'bt-analytics-popup',
  template: require('./analytics-popup.html'),
})
export class AnalyticsPopup {
  private AnalyticsConsent = AnalyticsConsent;
  @Input() private options: Options;

  @Output() private hideComponent = new EventEmitter<void>();

  private onAnalyticsConsentChange = (analyticsConsent: AnalyticsConsent) => {
    this.options.analyticsConsent = analyticsConsent;
    this.hideComponent.emit();
  }
}
