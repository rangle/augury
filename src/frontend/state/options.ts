import {Injectable} from '@angular/core';

export enum Theme {
  Light,
  Dark,
}

@Injectable()
export class Options {
  getTheme() {
    return new Promise<Theme>(resolve => {
      chrome.storage.sync.get('theme',
        (result: {theme: string})  => {
          switch (result.theme) {
            case 'light':
            default:
              resolve(Theme.Light);
              break;
            case 'dark':
              resolve(Theme.Dark);
              break;
          }
        });
    });
  }

  set theme(theme: Theme) {
    chrome.storage.sync.set({
      theme: theme,
    });
  }
}