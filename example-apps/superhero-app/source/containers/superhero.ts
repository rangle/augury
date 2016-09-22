import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'superheros-app',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    .row {
      display: flex;
      margin-top: 0.5rem;
    }
  `]
})
export class SuperherosApp {
  constructor(
    private router: Router
  ) { }
}
