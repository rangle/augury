import {Component} from '@angular/core';

import Hello from './hello';

@Component({
  selector: 'ngfor-directive',
  directives: [Hello],
  template: `
  <div>
     <hello *ngFor="#name of names" [msg]="'Hello from ' + name"></hello>
  </div>
  `
})
export default class NgForDirective {
  private names = [
    'John',
    'Sam',
    'Mike',
    'Sumit',
    'Igor'
  ];
}
