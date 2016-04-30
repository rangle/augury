import {Component, Inject} from '@angular/core';

import Service3 from '../../services/service3';
import Service4 from '../../services/service4';

@Component({
  selector: 'component5',
  providers: [Service3, Service4],
  template: `
    <p>component5 init: service3, service4</p>
    {{service3Value}}
    {{service4Value}}
  `
})
export default class Component5 {

  service3Value: string;
  service4Value: string;

  constructor(
    private s3: Service3,
    private s4: Service4
  ) {
    this.service3Value = s3.value;
    this.service4Value = s4.value;
  }
}
