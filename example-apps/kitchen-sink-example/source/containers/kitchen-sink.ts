import { Component, View, Inject, OnInit, OnDestroy }
 from 'angular2/core';
import { ROUTER_DIRECTIVES, RouteConfig, RouterLink, RouterOutlet}
 from 'angular2/router';

import Home from '../components/home';
import Start from '../components/router/start';
import InputOutput from '../components/input-output/input-output';
import MyForm from '../components/form-controls/my-form';
import Form2 from '../components/form-controls/form2';

@RouteConfig([
  { path: '/', component: Home, as: 'Home' },
  { path: '/input-output', component: InputOutput, as: 'InputOutput' },
  { path: '/my-form', component: MyForm, as: 'MyForm' },
  { path: '/form2', component: Form2, as: 'Form2' },
  { path: '/start/...', component: Start, as: 'Start' },
])
@Component({
  selector: 'kitchen-sink',
  directives: [RouterLink, ROUTER_DIRECTIVES],
  template: `
  <div class="row">
    <div class="col-sm-3">
      <ul class="nav nav-pills nav-stacked">
      <li role="presentation">
        <a [routerLink]="['./Home']">Home</a>
      </li>
      <li role="presentation">
        <a [routerLink]="['./MyForm']">Form Component</a>
      </li>
      <li role="presentation">
        <a [routerLink]="['./Form2']">NgModel Form</a>
      </li>
      <li role="presentation">
        <a [routerLink]="['./InputOutput']">InputOutput</a>
      </li>
      <li role="presentation">
        <a [routerLink]="['./Start', 'StartMain']">Router</a>
      </li>
      </ul>
    </div>
    <div class="col-sm-9">
      <router-outlet></router-outlet>
    </div>
  </div>
  `
})
export default class KitchenSink { }
