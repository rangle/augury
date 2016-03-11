import {Component} from 'angular2/core';

import Component1 from './component1';
import Component2 from './component2';

import Service1 from '../../services/service1';

@Component({
  selector: 'di-tree',
  directives: [Component1, Component2],
  providers: [Service1],
  template: `
  <div>
    <p>di-app init: service1</p>
    {{service1Value}}
    <hr/>
    <component1></component1>
    <component2></component2>
  </div>
  `
})
export default class DITree {

  service1Value: string;

  constructor(
    private s1: Service1
  ) {
    this.service1Value = s1.value;
  }


}
