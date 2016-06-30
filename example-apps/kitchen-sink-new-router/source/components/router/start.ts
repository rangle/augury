import {Component} from '@angular/core';

import {
  ROUTER_DIRECTIVES,
  RouterConfig,
  Router
} from '@angular/router';

import StartChild from './start-child';
import StartMain from './start-main';
import InnerChild from './inner-child';
import AuxComp from './aux-comp';
import RouterData1 from './router-data1';
import RouterData2 from './router-data2';

@Component({
  selector: 'start',
  directives: [ROUTER_DIRECTIVES],
  template: `
  <div>
    <ul class="nav nav-pills">
      <li>
        <a [routerLink]="['/start/main']">StartMain</a>
      </li>
      <li>
        <a [routerLink]="['/start/child']">StartChild</a>
      </li>
      <li>
        <a (click)="gotoRouterData1()">
          RouterData1
        </a>
      </li>
      <li>
        <a (click)="gotoRouterData2()">
          RouterData2
        </a>
      </li>
    </ul>
    <hr/>
    <div class="inner-outlet">
      <router-outlet></router-outlet>
    </div>
  </div>
  `
})
export default class Start {

  constructor(private router: Router) { }

  gotoRouterData1() {
    this.router.navigate(['/start/router-data1', 'Message from router']);
  }

  gotoRouterData2() {
    this.router.navigate(['/start/router-data2',
      'Message from router', 'Router Name']);
  }

}
