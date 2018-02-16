import {Injectable} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  ComponentView,
  SimpleOptions,
  Theme,
  defaultOptions,
  loadOptions,
  saveOptions,
  AnalyticsConsent,
} from '../../options';

export {ComponentView};
export {SimpleOptions};
export {Theme};
export {AnalyticsConsent};

@Injectable()
export class Options {
  private cachedOptions = defaultOptions();

  private subject = new Subject<Options>();

  get changes(): Observable<Options> {
    return this.subject.asObservable();
  }

  load() {
    return loadOptions().then(options => {
      Object.assign(this.cachedOptions, options);

      this.publish();

      return options;
    });
  }

  get theme(): Theme {
    return this.cachedOptions.theme;
  }

  set theme(theme: Theme) {
    this.cachedOptions.theme = theme;
    this.publish();
  }

  get analyticsConsent(): AnalyticsConsent {
    return this.cachedOptions.analyticsConsent;
  }

  set analyticsConsent(analyticsConsent: AnalyticsConsent) {
    this.cachedOptions.analyticsConsent = analyticsConsent;
    this.publish();
  }

  get componentView(): ComponentView {
    return this.cachedOptions.componentView;
  }

  set componentView(componentView: ComponentView) {
    this.cachedOptions.componentView = componentView;
    this.publish();
  }

  get diagnoticToolsEnabled(): boolean {
    return this.cachedOptions.diagnosticToolsEnabled;
  }

  set diagnosticToolsEnabled(toggle: boolean) {
    this.cachedOptions.diagnosticToolsEnabled = toggle;
    this.publish();
  }

  simpleOptions(): SimpleOptions {
    return this.cachedOptions;
  }

  private publish() {
    saveOptions(this.cachedOptions);
    this.subject.next(this);
  }
}
