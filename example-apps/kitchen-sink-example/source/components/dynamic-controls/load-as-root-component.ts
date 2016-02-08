import {Component, DynamicComponentLoader, ElementRef, Injector}
 from 'angular2/core';
import DynamicComponent from './dynamic-component';
import Hello from './hello';

@Component({
  selector: 'load-as-root-component',
  directives: [
    Hello
  ],
  template: `
    <div class="wrapper">
      <h3>LoadAsRoot Component</h3>
      <div id="anchor"></div>
    </div>`
})
export default class LoadAsRootComponent {
  constructor(dcl: DynamicComponentLoader,
    elementRef: ElementRef,
    injector: Injector) {
    dcl.loadAsRoot(DynamicComponent, '#anchor', null)
      .then(componentRef => console.log('loadAsRoot', componentRef));
  }
}
