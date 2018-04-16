import {
  EventEmitter,
  Component,
  Input,
  Output,
} from '@angular/core';

import {Options, Theme} from '../../state';

import {
  ApplicationErrorType,
  ApplicationError,
} from '../../../communication';

@Component({
  selector: 'render-error',
  templateUrl: './render-error.html',
  host: {
    '[class.dark]': 'isDevtoolsDarkTheme'
  }
})
export class RenderError {
  @Input() error: ApplicationError;
  @Output() private reportError: EventEmitter<boolean> = new EventEmitter<boolean>();

  private isDevtoolsDarkTheme = this.setIsDarkTheme();
  private ApplicationErrorType = ApplicationErrorType;

  constructor(private options: Options) {
  }

  setIsDarkTheme() {
    return (<any>chrome.devtools.panels).themeName === 'dark' &&
      this.options.theme === Theme.Dark;
  }
}
