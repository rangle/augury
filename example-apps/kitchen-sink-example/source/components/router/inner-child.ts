import {Component} from '@angular/core';
import {
  ROUTER_DIRECTIVES
} from '@angular/router';


@Component({
  selector: 'inner-child',
  directives: [ROUTER_DIRECTIVES],
  template: `
  <div>
    <h3>InnerChild Component</h3>
    <ul class="nav nav-pills nav-inverse">
      <li><a [routerLink]="['./']">InnerChildMain</a></li>
      <li><a [routerLink]="['child2']">InnerChild2</a></li>
    </ul>
    <hr/>
    <router-outlet></router-outlet>
  </div>
  `
})
export default class InnerChild { }
