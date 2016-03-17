import {Component, Inject} from 'angular2/core';

import Service1 from '../../services/service1';
import Service2 from '../../services/service2';

@Component({
  selector: 'component6',
  template: `
    <p>component6</p>
    {{service1Value}}
    {{service2Value}}
    <hr/>
  `
})
export default class Component6 {

  service1Value: string;
  service2Value: string;

  constructor(
    private s1: Service1,
    private s2: Service2
  ) {
    this.service1Value = s1.value;
    this.service2Value = s2.value;
  }
}
