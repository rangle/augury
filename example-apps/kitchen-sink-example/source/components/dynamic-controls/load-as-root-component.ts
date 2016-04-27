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
      <button class="btn btn-warning" (click)="loadComponent()">
        Load Component
      </button>
      <div id="anchor"></div>
    </div>`
})
export default class LoadAsRootComponent {
  constructor(
    private dcl: DynamicComponentLoader,
    private elementRef: ElementRef,
    private injector: Injector) { }

  loadComponent() {
    this.dcl.loadAsRoot(DynamicComponent, '#anchor', this.injector)
      .then(componentRef => console.log('loadAsRoot', componentRef));
  }
}
