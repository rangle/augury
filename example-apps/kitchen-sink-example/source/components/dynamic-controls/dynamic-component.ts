import {Component, ChangeDetectorRef} from '@angular/core';
import Hello from './hello';

@Component({
  selector: 'dynamic-component',
  directives: [
    Hello
  ],
  template: `
    <div class="wrapper">
      <h4>Dynamically loaded component</h4>
      <hello></hello>
    </div>`
})
export default class DynamicComponent {}
