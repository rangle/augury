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
} from '../../options';

export {ComponentView};
export {SimpleOptions};
export {Theme};

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

  get componentView(): ComponentView {
    return this.cachedOptions.componentView;
  }

  set componentView(componentView: ComponentView) {
    this.cachedOptions.componentView = componentView;
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
