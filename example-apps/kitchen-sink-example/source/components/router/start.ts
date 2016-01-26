import {Component, View} from 'angular2/core';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouterLink,
  RouterOutlet
} from 'angular2/router';

import StartChild from './start-child';
import StartMain from './start-main';

@Component({
  selector: 'start'
})
@RouteConfig([
  {path: '/', component: StartMain, as: 'StartMain'  },
  {path: '/child', component: StartChild, as: 'StartChild'  }
])
@View({
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
    Start Component
    <li><a [routerLink]="['./StartMain']">StartMain</a></li>
    <li><a [routerLink]="['./StartChild']">StartChild</a></li>
    <router-outlet></router-outlet>
  </div>
  `
})
export default class Start { }
