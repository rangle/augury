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

export const StartRouter: RouterConfig = [
  {
    path: '',
    redirectTo: '/start',
    terminal: true
  }, {
    path: 'start',
    component: Start,
    children: [{
      path: '',
      component: StartMain
    }, {
      path: 'child',
      component: StartChild
    }, {
        path: 'router-data2/:name/:message',
        component: RouterData2
      }]
  }
  // { aux: '/auxcomp', component: AuxComp },
  // { path: '/router-data1/:message', component: RouterData1,
    // data: { passedData: 'Passed in via Data'}},
];

// @RouteConfig([
//   { path: '/inner-child/...', component: InnerChild, name: 'InnerChild' },
// ])
@Component({
  selector: 'start',
  directives: [ROUTER_DIRECTIVES],
  template: `
  <div>
    <ul class="nav nav-pills">
      <li>
        <a [routerLink]="['/start']">StartMain</a>
      </li>
      <li>
        <a [routerLink]="['/child']">StartChild</a>
      </li>
      <li>
        <a [routerLink]="['/routerdata1',
          {message: 'Message from router'}]">
          RouterData1
        </a>
      </li>
      <li>
        <a [routerLink]="['/routerdata2',
          {message: 'Message from router', name:'Router Name'}]">
          RouterData2
        </a>
      </li>
      <li>
        
      </li>
      <li>
        
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
    // this.router.unregisterPrimaryOutlet = function(outlet) {
    //     // does not throw
    //     this._outlet = null;
    // };
  }

}
