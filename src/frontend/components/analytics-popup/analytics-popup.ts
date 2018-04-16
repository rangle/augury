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
  templateUrl: './analytics-popup.html',
})
export class AnalyticsPopup {
  AnalyticsConsent = AnalyticsConsent;
  @Input() private options: Options;

  @Output() private hideComponent = new EventEmitter<void>();

  onAnalyticsConsentChange = (analyticsConsent: AnalyticsConsent) => {
    this.options.analyticsConsent = analyticsConsent;
    this.hideComponent.emit();
  }
}
