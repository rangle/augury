import {Component, Input} from 'angular2/core';
import LoadIntoComponent from './load-into-component';
import LoadAsRootComponent from './load-as-root-component';
import LoadNextToComponent from './load-next-to-component';

@Component({
  selector: 'dynamic-controls',
  template: `
    <div>
      <load-into-component></load-into-component>
      <hr/>
      <load-next-to-component></load-next-to-component>
      <hr/>
      <load-as-root-component></load-as-root-component>
    </div>
  `,
  directives: [LoadIntoComponent, LoadAsRootComponent, LoadNextToComponent]
})
export default class DynamicControls {}
