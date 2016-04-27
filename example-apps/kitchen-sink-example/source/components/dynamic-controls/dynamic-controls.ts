import {Component, Input} from 'angular2/core';
import LoadAsRootComponent from './load-as-root-component';
import LoadNextToComponent from './load-next-to-component';

@Component({
  selector: 'dynamic-controls',
  template: `
    <div>
      <load-next-to-component></load-next-to-component>
      <hr/>
      <load-as-root-component></load-as-root-component>
    </div>
  `,
  directives: [LoadAsRootComponent, LoadNextToComponent]
})
export default class DynamicControls {}
