import {Component, View} from 'angular2/core';
import {
  ROUTER_DIRECTIVES,
  RouteConfig,
  RouterLink,
  RouterOutlet,
  AuxRoute
} from 'angular2/router';

import StartChild from './start-child';
import StartMain from './start-main';
import InnerChild from './inner-child';
import AuxComp from './aux-comp';
import RouterData1 from './router-data1';
import RouterData2 from './router-data2';

@Component({
  selector: 'start'
})
@RouteConfig([
  { aux: '/auxcomp', component: AuxComp, as: 'AuxComp' },
  { path: '/', component: StartMain, as: 'StartMain'  },
  { path: '/child', component: StartChild, as: 'StartChild'  },
  { path: '/router-data1/:message', component: RouterData1, as: 'RouterData1',
    data: { passedData: 'Passed in via Data'}},
  { path: '/router-data2/:name/:message', component: RouterData2,
    as: 'RouterData2'},
  { path: '/inner-child/...', component: InnerChild, as: 'InnerChild' },
])
@View({
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div>
      <h3>Start Component</h3>
      <h4>
        <ul>
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
      </h4>
      <router-outlet></router-outlet>
      <router-outlet name="auxcomp"></router-outlet>
  </div>
  `
})
export default class Start { }
