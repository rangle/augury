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
  templateUrl: './report-error.html',
  styleUrls: ['./report-error.css'],
})
export class ReportError {
  @Input() error: ApplicationError;
  @Output() private reportError: EventEmitter<boolean> = new EventEmitter<boolean>();
}
