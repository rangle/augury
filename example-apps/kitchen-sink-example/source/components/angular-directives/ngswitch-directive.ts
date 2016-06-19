import {Component} from '@angular/core';

import Hello from './hello';

@Component({
  selector: 'ngswitch-directive',
  directives: [Hello],
  template: `
  <div>
     <div class="container" [ngSwitch]="color">
        <hello *ngSwitchCase="'red'" [msg]="'Color is Red'"></hello>
        <hello *ngSwitchCase="'green'" [msg]="'Color is Green'"></hello>
        <hello *ngSwitchCase="'yellow'" [msg]="'Color is Yellow'"></hello>
        <hello *ngSwitchCase="'blue'" [msg]="'Color is Blue'"></hello>
        <hello *ngSwitchCase="'grey'" [msg]="'Color is Grey'"></hello>
        <hello *ngSwitchDefault [msg]="'No Color Selected'"></hello>
     </div>
     <button class="btn btn-success" (click)="switch()">Switch Color</button>
  </div>
  `
})
export default class NgSwitchDirective {
  private color = 'red';

  private colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'grey',
    'aaa',
    'bbb'
  ];

  switch() {
    const random = parseInt(Math.random() * 6 + '', 10);
    this.color = this.colors[random];
  }

}
