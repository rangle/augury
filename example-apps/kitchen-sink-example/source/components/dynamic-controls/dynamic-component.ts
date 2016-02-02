import {Component, ChangeDetectorRef} from 'angular2/core';
import Hello from './hello';

@Component({
  selector: 'dynamic-component',
  directives: [
    Hello
  ],
  template: `
    <div class="wrapper">
      <h5>Dynamically loaded component</h5>
      <hello></hello>
    </div>`
})
export default class DynamicComponent {}