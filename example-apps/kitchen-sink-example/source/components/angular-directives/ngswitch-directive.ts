import {Component} from '@angular/core';

import HelloDirectives from './hello-directives';

@Component({
  selector: 'ngswitch-directive',
  directives: [HelloDirectives],
  template: `
  <div>
     <div class="container" [ngSwitch]="color">
        <hello-directives *ngSwitchCase="'red'" [msg]="'Color is Red'">
        </hello-directives>
        
        <hello-directives *ngSwitchCase="'green'" [msg]="'Color is Green'">
        </hello-directives>
        
        <hello-directives *ngSwitchCase="'yellow'" [msg]="'Color is Yellow'">
        </hello-directives>
        
        <hello-directives *ngSwitchCase="'blue'" [msg]="'Color is Blue'">
        </hello-directives>
        
        <hello-directives *ngSwitchCase="'grey'" [msg]="'Color is Grey'">
        </hello-directives>
        
        <hello-directives *ngSwitchDefault [msg]="'No Color Selected'">
        </hello-directives>
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
