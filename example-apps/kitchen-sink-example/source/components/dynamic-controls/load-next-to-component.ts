import {Component, DynamicComponentLoader, ElementRef} from 'angular2/core';
import DynamicComponent from './dynamic-component';
import Hello from './hello';

@Component({
  selector: 'load-next-to-component',
  directives: [
    Hello
  ],
  template: `
    <h3>LoadNextToLocation Component</h3>`
})
export default class LoadNextToComponent {
  constructor(dcl: DynamicComponentLoader,
    elementRef: ElementRef) {
    dcl.loadNextToLocation(DynamicComponent, elementRef)
      .then(componentRef => console.log('loadNextToLocation', componentRef));
  }
}
