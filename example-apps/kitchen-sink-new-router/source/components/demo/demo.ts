import {Component} from '@angular/core';
import DemoComponent from './demo-component';
import Service1 from '../../services/service1';
import Service2 from '../../services/service2';

@Component({
  selector: 'demo',
  directives: [DemoComponent],
  providers: [Service1, Service2],
  template: `
  <div>
    <demo-comp
      [msg]='"input data"'
      (newMsg)='doStuff($event)'>
    </demo-comp>
  </div>
  `
})
export default class Demo {
  doStuff($event) {
    console.log($event);
  }
}
