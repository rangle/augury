import {Component} from '@angular/core';

import HelloDirectives from './hello-directives';

@Component({
  selector: 'ngfor-directive',
  directives: [HelloDirectives],
  template: `
  <div>
     
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
