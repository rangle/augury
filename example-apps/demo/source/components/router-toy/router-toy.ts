import { Component } from '@angular/core';
import {
  Router,
  ActivatedRoute,
} from '@angular/router';

import { Subscription } from 'rxjs';

@Component({
  selector: 'router-toy',
  template: `
  <h3>Router</h3>
  <div class="panel-body">
    <ul class="nav nav-pills">
      <li [ngClass]="{ active: path.indexOf('/router-toy/main') === 0 }">
        <a [routerLink]="['/router-toy/main']">Start Main</a>
      </li>
      <li [ngClass]="{ active: path.indexOf('/router-toy/child') === 0 }">
        <a [routerLink]="['/router-toy/child']">Start Child</a>
      </li>
      <li [ngClass]="{ active: path.indexOf('aux:aux') !== -1 }">
        <a [routerLink]="[{outlets: {aux: 'aux'}}]">Open AuxComp</a>
      </li>
      <li [ngClass]="{ active: path.indexOf('/router-toy/') === 0 && path.indexOf('data-1/message') !== -1 }">
        <a [routerLink]="['/router-toy/data-1', 'message']">RouterToyData1</a>
      </li>
      <li [ngClass]="{ active: path.indexOf('/router-toy/') === 0 && path.indexOf('data-2/message/name') !== -1}">
        <a [routerLink]="['/router-toy/data-2', 'message', 'name']">RouterToyData2</a>
      </li>
      <li [ngClass]="{ active: path.indexOf('/router-toy/inner-child') === 0 }">
        <a [routerLink]="['/router-toy/inner-child']">InnerChild</a>
      </li>
    </ul>
    <hr/>
    <div class="inner-outlet">
      <router-outlet></router-outlet>
      <router-outlet name="aux"></router-outlet>
    </div>
  </div>
  `
})
export class RouterToy {
  path: string = '';

  constructor (router: Router) {
    router.events.subscribe(data => { this.path = data.url; });
  }
}

@Component({
  selector: 'router-toy-aux',
  template: `
  <div>
    <h4>Hello There!!</h4>
    <h5>I am Aux</h5>
  </div>
  `
})
export class RouterToyAux {}

@Component({
  selector: 'router-toy-child',
  template: `
    <div class="alert alert-success">
      <h4>Router Start child component</h4>
    </div>
  `
})
export class RouterToyChild {}

@Component({
  selector: 'router-toy-data-1',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Data: {{data}}</h4>
  </div>
  `
})
export class RouterToyData1 {
  public message: string;
  public data: string;
  private sub: Subscription;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(({name}) => {
      this.message = name;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

@Component({
  selector: 'router-toy-data-2',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Name: {{name}}</h4>
  </div>
  `
})
export class RouterToyData2 {
  public message: string;
  public name: string;
  private sub: Subscription;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(({name, message}) => {
      this.name = name;
      this.message = message;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

@Component({
  selector: 'inner-child',
  template: `
  <div>
    <h3>InnerChild Component</h3>
    <ul class="nav nav-pills nav-inverse">
      <li><a [routerLink]="['./']">InnerChildMain</a></li>
      <li><a [routerLink]="['child-2']">InnerChild2</a></li>
    </ul>
    <hr/>
    <router-outlet></router-outlet>
  </div>
  `
})
export class RouterToyInnerChild {}

@Component({
  selector: 'router-toy-inner-child-2',
  template: `
    <div class="alert alert-info">
      <h4>Inner child 2</h4>
    </div>
  `
})
export class RouterToyInnerChild2 {}

@Component({
  selector: 'router-toy-inner-child-main',
  template: `
    <div class="alert alert-success">
      <h4>Inner child main</h4>
    </div>
  `
})
export class RouterToyInnerChildMain {}

@Component({
  selector: 'router-toy-main',
  template: `
    <div class="alert alert-warning">
      <h4>RouterToyMain component</h4>
    </div>
  `
})
export class RouterToyMain {}
