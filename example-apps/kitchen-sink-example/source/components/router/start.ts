import {Component} from '@angular/core';

import {
  Router
} from '@angular/router';

import StartChild from './start-child';
import StartMain from './start-main';
import InnerChild from './inner-child';
import AuxComp from './aux-comp';
import RouterData1 from './router-data1';
import RouterData2 from './router-data2';

@Component({
  selector: 'start',
  template: `
  <div>
    <ul class="nav nav-pills">
      <li>
        <a (click)="goToRoute(0)">Start Main</a>
      </li>
      <li>
        <a (click)="goToRoute(1)">Start Child</a>
      </li>
      <li>
        <a (click)="goToRoute(2)">Open AuxComp</a>
      </li>
      <li>
        <a (click)="goToRoute(3)">
          RouterData1
        </a>
      </li>
      <li>
        <a (click)="goToRoute(4)">
          RouterData2
        </a>
      </li>
      <li>
        <a [routerLink]="['/start', 'inner-child']">InnerChild</a>
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
export default class Start {

  constructor(private router: Router) { }

  goToRoute(index) {
    if (index === 0) {
      this.router.navigate(['/start/main']);
    } else if (index === 1) {
      this.router.navigate(['/start/child']);
    } else if (index === 2) {
      this.router.navigateByUrl('start/(aux:auxcomp)');
    } else if (index === 3) {
      this.router.navigate(['/start/router-data1', 'Message from router']);
    } else if (index === 4) {
      this.router.navigate(['/start/router-data2',
      'Message from router', 'Router Name']);
    }
  }
}
