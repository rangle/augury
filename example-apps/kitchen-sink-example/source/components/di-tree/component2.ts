import {Component, Inject} from '@angular/core';

import Service2 from '../../services/service2';

@Component({
  selector: 'component2',
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
