import {Component} from '@angular/core';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouterLink,
  RouterOutlet,
  AuxRoute,
  Router
} from '@angular/router-deprecated';

import StartChild from './start-child';
import StartMain from './start-main';
import InnerChild from './inner-child';
import AuxComp from './aux-comp';
import RouterData1 from './router-data1';
import RouterData2 from './router-data2';

@RouteConfig([
  { aux: '/auxcomp', component: AuxComp, name: 'AuxComp' },
  { path: '/', component: StartMain, name: 'StartMain'  },
  { path: '/child', component: StartChild, name: 'StartChild'  },
  { path: '/router-data1/:message', component: RouterData1, name: 'RouterData1',
    data: { passedData: 'Passed in via Data'}},
  { path: '/router-data2/:name/:message', component: RouterData2,
    name: 'RouterData2'},
  { path: '/inner-child/...', component: InnerChild, name: 'InnerChild' },
])
@Component({
  selector: 'start',
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
    <ul class="nav nav-pills">
      <li>
        <a [routerLink]="['./StartMain']">StartMain</a>
      </li>
      <li>
        <a [routerLink]="['./StartChild']">StartChild</a>
      </li>
      <li>
        <a [routerLink]="['./RouterData1',
          {message: 'Message from router'}]">
          RouterData1
        </a>
      </li>
      <li>
        <a [routerLink]="['./RouterData2',
          {message: 'Message from router', name:'Router Name'}]">
          RouterData2
        </a>
      </li>
      <li>
        <a [routerLink]="['./InnerChild', 'InnerChildMain']">InnerChild</a>
      </li>
      <li>
        <a [routerLink]="['./', ['AuxComp']]">Open AuxComp</a>
      </li>
    </ul>
    <hr/>
    <router-outlet></router-outlet>
    <router-outlet name="auxcomp"></router-outlet>
  </div>
  `
})
export default class Start {

  constructor(private router: Router) {
    // injected Router on the component that defines the aux routes
    this.router.unregisterPrimaryOutlet = function(outlet) {
        // does not throw
        this._outlet = null;
    };
  }

}
