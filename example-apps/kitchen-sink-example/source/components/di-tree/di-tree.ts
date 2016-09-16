import {Component} from '@angular/core';

import Service1 from '../../services/service1';

@Component({
  selector: 'di-tree',
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
