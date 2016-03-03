import {Component, View} from 'angular2/core';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouterLink,
  RouterOutlet
} from 'angular2/router';

import InnerChild2 from './inner-child2';
import InnerChildMain from './inner-child-main';

@Component({
  selector: 'inner-child'
})
@RouteConfig([
  {path: '/', component: InnerChildMain, as: 'InnerChildMain'  },
  {path: '/child2', component: InnerChild2, as: 'InnerChild2'  }
])
@View({
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
    <h3>InnerChild Component</h3>
    <h4>
      <ul>
        <li><a [routerLink]="['./InnerChildMain']">InnerChildMain</a></li>
        <li><a [routerLink]="['./InnerChild2']">InnerChild2</a></li>
      </ul>
    </h4>
    <router-outlet></router-outlet>
  </div>
  `
})
export default class InnerChild { }
