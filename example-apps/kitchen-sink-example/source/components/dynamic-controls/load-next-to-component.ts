import {Component, DynamicComponentLoader, ElementRef}
from 'angular2/core';
import DynamicComponent from './dynamic-component';
import Hello from './hello';

@Component({
  selector: 'load-next-to-component',
  directives: [
    Hello
  ],
  template: `
    <h3>LoadNextToLocation Component</h3>
    <button class="btn btn-success" (click)="loadComponent()">
      Load Component
    </button>
  `
})
export default class LoadNextToComponent {
  constructor(
    private dcl: DynamicComponentLoader,
    private elementRef: ElementRef) { }

  loadComponent() {
    this.dcl.loadNextToLocation(DynamicComponent, this.elementRef)
      .then(componentRef => console.log('loadNextToLocation', componentRef));
  }
}
