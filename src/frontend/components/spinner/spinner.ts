import {
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'spinner',
  template: require('./spinner.html'),
  styles: [require('to-string!./spinner.css')],
})
export class Spinner {}

