import {Component, Inject} from '@angular/core';

import Component3 from './component3';
import Component4 from './component4';

import Service3 from '../../services/service3';

@Component({
  selector: 'component1',
  providers: [Service3],
  directives: [Component3, Component4],
  template: `
    <p>component1 init: service3</p>
    {{service3Value}}
    <hr/>
    <component3></component3>
    <component4></component4>
  `
})
export default class Component1 {
  service3Value: string;

  constructor(
    private s3: Service3
  ) {
    this.service3Value = s3.value;
  }
}
