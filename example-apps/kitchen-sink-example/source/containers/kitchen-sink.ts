import { Component, Inject, OnInit, OnDestroy }
 from '@angular/core';
import {
  Router,
  ActivatedRoute,
}
 from '@angular/router';

@Component({
  selector: 'kitchen-sink',
  template: `
  <div class="row">
    <div class="col-md-3">
      <ul class="nav nav-pills nav-stacked">
      <li [ngClass]="{active: path==''}">
        <a [routerLink]="['/']">Home</a>
      </li>
      <li [ngClass]="{active: path=='welcome'}">
        <a [routerLink]="['/lazy-load/lazy1']">Lazy Loaded Module</a>
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
      <li [ngClass]="{active: path=='metadata-test'}">
        <a [routerLink]="['./metadata-test']">MetadataTest</a>
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    router.events.subscribe((data) => {
      this.path = data.url.substr(1);
    });
  }

}
