import {Component, EventEmitter} from 'angular2/core';

@Component({
 selector: 'demo',
 template: `
  <h1 [ngStyle]="{
    'padding': padding,
    'color': textcolor,
    'font-size': size,
    'background-color': bgcolor
  }">
     {{msg}}
   </h1>
   <label>Message: <input type="text" [value]="msg"
   (change)="changeMsg($event)"></label>
 `,
 inputs: ['msg'],
 outputs: ['newMsg']
})
export default class Demo {
  msg: string;
  size: string = '50px';
  bgcolor: string = 'white';
  padding: string = '10px';
  textcolor: string = 'slategrey';
  newMsg: EventEmitter<string> = new EventEmitter<string>();

  changeMsg($event: any) {
    this.msg = $event.target.value;
    this.newMsg.emit(this.msg);
  }

}
