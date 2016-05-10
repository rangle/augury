import {Component} from '@angular/core';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouterLink,
  RouterOutlet
} from '@angular/router-deprecated';

import InnerChild2 from './inner-child2';
import InnerChildMain from './inner-child-main';

@RouteConfig([
  {path: '/', component: InnerChildMain, as: 'InnerChildMain'  },
  {path: '/child2', component: InnerChild2, as: 'InnerChild2'  }
])
@Component({
  selector: 'inner-child',
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
    <h3>InnerChild Component</h3>
    <ul class="nav nav-pills nav-inverse">
      <li><a [routerLink]="['./InnerChildMain']">InnerChildMain</a></li>
      <li><a [routerLink]="['./InnerChild2']">InnerChild2</a></li>
    </ul>
    <hr/>
    <router-outlet></router-outlet>
  </div>
  `
})
export default class InnerChild { }
