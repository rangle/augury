import {Component, Input} from '@angular/core';

import {
  ApplicationErrorType,
  ApplicationError,
} from '../../../communication';

@Component({
  selector: 'render-error',
  template: require('./render-error.html'),
})
export class RenderError {
  @Input() private error: ApplicationError;

  private ApplicationErrorType = ApplicationErrorType;
}
