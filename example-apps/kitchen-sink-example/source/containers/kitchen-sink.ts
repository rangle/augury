import { Component, Inject, OnInit, OnDestroy }
 from 'angular2/core';
import { ROUTER_DIRECTIVES, RouteConfig, RouterLink, RouterOutlet,
  Router}
 from 'angular2/router';

import Home from '../components/home';
import Start from '../components/router/start';
import InputOutput from '../components/input-output/input-output';
import MyForm from '../components/form-controls/my-form';
import Form2 from '../components/form-controls/form2';
import DynamicControls from '../components/dynamic-controls/dynamic-controls';
import ControlForm from '../components/form-controls/control-form';
import TodoApp from '../components/todo-app/todo-app';
import DITree from '../components/di-tree/di-tree';
import ChangeDetection from '../components/change-detection/change-detection';

@RouteConfig([
  { path: '/', component: Home, as: 'Home' },
  { path: '/input-output', component: InputOutput, as: 'InputOutput' },
  { path: '/my-form', component: MyForm, as: 'MyForm' },
  { path: '/form2', component: Form2, as: 'Form2' },
  { path: '/control-form', component: ControlForm, as: 'ControlForm' },
  { path: '/start/...', component: Start, as: 'Start' },
  { path: '/dynamic-controls', component: DynamicControls,
    as: 'DynamicControls' },
  { path: '/todo-app', component: TodoApp, as: 'TodoApp'},
  { path: '/di-tree', component: DITree, as: 'DITree' },
  { path: '/change-detection', component: ChangeDetection,
    as: 'ChangeDetection' },
])
@Component({
  selector: 'kitchen-sink',
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div class="row">
    <div class="col-md-3">
      <ul class="nav nav-pills nav-stacked">
      <li [ngClass]="{active: path==''}">
        <a [routerLink]="['./Home']">Home</a>
      </li>
      <li [ngClass]="{active: path=='control-form'}">
        <a [routerLink]="['./ControlForm']">ControlForm</a>
      </li>
      <li [ngClass]="{active: path=='my-form'}">
        <a [routerLink]="['./MyForm']">Form Component</a>
      </li>
      <li [ngClass]="{active: path=='form2'}">
        <a [routerLink]="['./Form2']">NgModel Form</a>
      </li>
      <li [ngClass]="{active: path=='input-output'}">
        <a [routerLink]="['./InputOutput']">InputOutput</a>
      </li>
      <li [ngClass]="{active: path=='start' || path=='start/child'}">
        <a [routerLink]="['./Start', 'StartMain']">Router</a>
      </li>
      <li [ngClass]="{active: path=='dynamic-controls'}">
        <a [routerLink]="['./DynamicControls']">DynamicControls</a>
      </li>
      <li [ngClass]="{active: path=='todo-app'}">
        <a [routerLink]="['./TodoApp']">TodoApp</a>
      </li>
      <li [ngClass]="{active: path=='di-tree'}">
        <a [routerLink]="['./DITree']">DITree</a>
      </li>
      <li [ngClass]="{active: path=='change-detection'}">
        <a [routerLink]="['./ChangeDetection']">ChangeDetection</a>
      </li>
      </ul>
    </div>
    <div class="col-md-9">
      <div class="panel panel-primary">
      <div class="panel-heading">
        <h4>{{path || 'home'}}</h4>
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
    router.subscribe((val) => this.path = val);
  }

}
