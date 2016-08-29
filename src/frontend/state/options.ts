import {Injectable} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

import {
  SimpleOptions,
  Theme,
  loadOptions,
  saveOptions,
} from '../../options';

export {SimpleOptions};
export {Theme};

@Injectable()
export class Options implements SimpleOptions {
  /// Show HTML elements in addition to components in the component tree
  private cachedShowElements = false;

  /// Theme (dark or light etc)
  private cachedTheme = Theme.Light;

  private subject = new Subject<Options>();

  get changes(): Observable<Options> {
    return this.subject.asObservable();
  }

  load() {
    return loadOptions().then(options => {
      this.cachedTheme = options.theme;
      this.cachedShowElements = options.showElements;

      this.publish();

      return options;
    });
  }

  get theme(): Theme {
    return this.cachedTheme;
  }

  set theme(theme: Theme) {
    this.cachedTheme = theme;

    saveOptions({ theme });

    this.publish();
  }

  get showElements(): boolean {
    return this.cachedShowElements;
  }

  set showElements(show: boolean) {
    this.cachedShowElements = show;

    saveOptions({showElements: show});

    this.publish();
  }

  simpleOptions(): {showElements: boolean, theme: Theme} {
    return {
      showElements: this.showElements,
      theme: this.theme,
    };
  }

  private publish() {
    this.subject.next(this);
  }
}

