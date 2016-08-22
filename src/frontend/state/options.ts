import {Injectable} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

export enum Theme {
  Light,
  Dark,
}

@Injectable()
export class Options {
  /// Show HTML elements in addition to components in the component tree
  private cachedShowElements: boolean;

  /// Theme (dark or light etc)
  private cachedTheme: Theme;

  private subject = new Subject<Options>();

  get changes(): Observable<Options> {
    return this.subject.asObservable();
  }

  load() {
    return new Promise<Options>(resolve => {
      let count = 2;

      const reduce = () => {
        if (--count === 0) {
          resolve(this);
        }
      };

      chrome.storage.sync.get('theme',
        (result: {theme: string}) => {
          switch ((result || {theme: null}).theme) {
            case 'light':
            default:
              this.theme = Theme.Light;
              break;
            case 'dark':
              this.theme = Theme.Dark;
              break;
          }
          reduce();
        });

      // TODO(cbond): I do not think we want to save this, do we?
      // chrome.storage.sync.get('show-elements',
      //   (result: {show: boolean}) => {
      //     this.showElements = (result || {show: false}).show;
      //     reduce();
      //   });
    });
  }

  get theme(): Theme {
    return this.cachedTheme;
  }

  set theme(theme: Theme) {
    this.cachedTheme = theme;

    chrome.storage.sync.set({
      theme: theme,
    });

    this.publish();
  }

  get showElements(): boolean {
    return this.cachedShowElements;
  }

  set showElements(show: boolean) {
    this.cachedShowElements = show;

    chrome.storage.sync.set({
      show: show,
    });

    this.publish();
  }

  private publish() {
    this.subject.next(this);
  }
}