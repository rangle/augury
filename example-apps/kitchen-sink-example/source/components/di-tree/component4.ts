import {Component, Inject} from 'angular2/core';

import Service1 from '../../services/service1';
import Service4 from '../../services/service4';

@Component({
  selector: 'component4 init: service4',
  providers: [Service4],
  template: `
    <p>component4</p>
    {{service1Value}}
    {{service4Value}}
    <hr/>
  `
})
export default class Component4 {

  service1Value: string;
  service4Value: string;

  constructor(
    private s1: Service1,
    private s4: Service4
  ) {
    this.service1Value = s1.value;
    this.service4Value = s4.value;
  }
}
