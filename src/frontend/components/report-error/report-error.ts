import {
  EventEmitter,
  Component,
  Input,
  Output,
} from '@angular/core';

import {
  ApplicationErrorType,
  ApplicationError,
} from '../../../communication';

@Component({
  selector: 'report-error',
  template: require('./report-error.html'),
  styles: [require('to-string!./report-error.css')],
})
export class ReportError {
  @Input() private error: ApplicationError;
  @Output() private reportError: EventEmitter<boolean> = new EventEmitter<boolean>();
}
