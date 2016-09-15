import {Component} from '@angular/core';

@Component({
  selector: 'inner-child',
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
