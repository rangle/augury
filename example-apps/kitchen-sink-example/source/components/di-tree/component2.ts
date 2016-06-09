import {Component, Inject} from '@angular/core';

import Component5 from './component5';
import Component6 from './component6';

import Service2 from '../../services/service2';

@Component({
  selector: 'component2',
  directives: [Component5, Component6],
  providers: [Service2],
  template: `
    <p>component2 init service2</p>
    {{service2Value}}
    <hr/>
    <component5></component5>
    <component6></component6>
  `
})
export default class Component2 {
  service2Value: string;

  constructor(
    private s2: Service2
  ) {
    this.service2Value = s2.value;
  }
}
