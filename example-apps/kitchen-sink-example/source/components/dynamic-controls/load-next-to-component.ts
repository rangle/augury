import {Component, DynamicComponentLoader, ViewContainerRef}
from '@angular/core';
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
    private viewContainerRef: ViewContainerRef) { }

  loadComponent() {
    this.dcl.loadNextToLocation(DynamicComponent, this.viewContainerRef)
      .then(componentRef => console.log('loadNextToLocation', componentRef));
  }
}
