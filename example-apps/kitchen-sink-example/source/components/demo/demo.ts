import {Component} from '@angular/core';

@Component({
  selector: 'demo',
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
