import {Component, EventEmitter, Input, Output} from '@angular/core';
import Service1 from '../../services/service1';
import Service2 from '../../services/service2';
import {FormatService} from '../todo-app/todo-service';
import DITree from '../di-tree/di-tree';

@Component({
 selector: 'demo-comp',
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
 providers: [DITree]
})
export default class DemoComponent {
  @Input() msg: string;
  @Output() newMsg: EventEmitter<string> = new EventEmitter<string>();

  size: string = '50px';
  bgcolor: string = 'white';
  padding: string = '10px';
  textcolor: string = 'slategrey';

  constructor(
    private s1: Service1,
    private s2: Service2,
    private fs: FormatService,
    private di: DITree
  ) {}

  changeMsg($event: any) {
    this.msg = $event.target.value;
    this.newMsg.emit(this.msg);
  }

}
