import { Component, Inject, OnInit, OnDestroy }
 from '@angular/core';
import { ROUTER_DIRECTIVES, RouterConfig, Router}
 from '@angular/router';

import {CamelCasePipe} from '../pipes/camelcase';

import Home from '../components/home';
import InputOutput from '../components/input-output/input-output';
import MyForm from '../components/form-controls/my-form';
import Form2 from '../components/form-controls/form2';
import DynamicControls from '../components/dynamic-controls/dynamic-controls';
import ControlForm from '../components/form-controls/control-form';
import TodoApp from '../components/todo-app/todo-app';
import DITree from '../components/di-tree/di-tree';
import ChangeDetection from '../components/change-detection/change-detection';
import AngularDirectives from
  '../components/angular-directives/angular-directives';
import Demo from '../components/demo/demo';
import StressTester from '../components/stress-tester/stress-tester';

import Start from '../components/router/start';
import StartChild from '../components/router/start-child';
import StartMain from '../components/router/start-main';
import InnerChild from '../components/router/inner-child';
import RouterData1 from '../components/router/router-data1';
import RouterData2 from '../components/router/router-data2';
import AuxComp from '../components/router/aux-comp';

export const KitchenSinkRoutes: RouterConfig = [
  { path: '', component: Home },
  { path: 'input-output', component: InputOutput },
  { path: 'my-form', component: MyForm },
  { path: 'form2', component: Form2 },
  { path: 'control-form', component: ControlForm },
  { path: 'dynamic-controls', component: DynamicControls },
  { path: 'todo-app', component: TodoApp },
  { path: 'di-tree', component: DITree },
  { path: 'angular-directives', component: AngularDirectives },
  { path: 'change-detection', component: ChangeDetection },
  { path: 'demo', component: Demo },
  { path: 'stress-tester', component: StressTester },
  { path: 'start', component: Start, children: [
    { path: 'main', component: StartMain },
    { path: 'auxcomp', component: AuxComp, outlet: 'aux' },
    { path: 'child', component: StartChild },
    { path: 'router-data1/:name', component: RouterData1 },
    { path: 'router-data2/:name/:message', component: RouterData2 }]
  }
];

@Component({
  selector: 'kitchen-sink',
  directives: [ROUTER_DIRECTIVES],
  pipes: [CamelCasePipe],
  template: `
  <div class="row">
    <div class="col-md-3">
      <ul class="nav nav-pills nav-stacked">
      <li [ngClass]="{active: path==''}">
        <a [routerLink]="['/home']">Home</a>
      </li>
      <li [ngClass]="{active: path=='demo'}">
        <a [routerLink]="['/demo']">Demo</a>
      </li>
      <li [ngClass]="{active: path=='control-form'}">
        <a [routerLink]="['/control-form']">ControlForm</a>
      </li>
      <li [ngClass]="{active: path=='my-form'}">
        <a [routerLink]="['/my-form']">Form Component</a>
      </li>
      <li [ngClass]="{active: path=='form2'}">
        <a [routerLink]="['/form2']">NgModel Form</a>
      </li>
      <li [ngClass]="{active: path=='input-output'}">
        <a [routerLink]="['/input-output']">InputOutput</a>
      </li>
      <li [ngClass]="{active: path.indexOf('start') > -1}">
        <a [routerLink]="['/start/main']">Router</a>
      </li>
      <li [ngClass]="{active: path=='dynamic-controls'}">
        <a [routerLink]="['/dynamic-controls']">DynamicControls</a>
      </li>
      <li [ngClass]="{active: path=='todo-app'}">
        <a [routerLink]="['/todo-app']">TodoApp</a>
      </li>
      <li [ngClass]="{active: path=='di-tree'}">
        <a [routerLink]="['/di-tree']">DITree</a>
      </li>
      <li [ngClass]="{active: path=='angular-directives'}">
        <a [routerLink]="['/angular-directives']">AngularDirectives</a>
      </li>
      <li [ngClass]="{active: path=='change-detection'}">
        <a [routerLink]="['/change-detection']">ChangeDetection</a>
      </li>
      <li [ngClass]="{active: path=='stress-tester'}">
        <a [routerLink]="['./stress-tester']">StressTester</a>
      </li>
      </ul>
    </div>
    <div class="col-md-9">
      <div class="panel panel-primary">
        <div class="panel-heading">
          <h3 class="panel-title">{{path || 'home' | camelcase }}</h3>
        </div>
        <div class="panel-body">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  </div>
  `
})
export default class KitchenSink {
  public path: string = '';

  constructor(private router: Router) {
    console.log(router);
    // router.subscribe((val) => {
    //   this.path = val.instruction.urlPath;
    // });
  }

}
