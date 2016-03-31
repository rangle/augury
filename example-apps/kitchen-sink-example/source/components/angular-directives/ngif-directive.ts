import {Component} from 'angular2/core';

import Hello from './hello';

@Component({
  selector: 'ngif-directive',
  directives: [Hello],
  template: `
  <div>
    <hello [msg]='"Hello from John!!"' *ngIf="sayHello"></hello>
    <hello [msg]='"Hi from John!!"' *ngIf="!sayHello"></hello>

    <button class="btn btn-primary" (click)="toggle()">
      {{sayHello ? 'Say Hi': 'Say Hello'}}
    </button>
  </div>
  `
})
export default class NgIfDirective {
  private sayHello: boolean = false;

  toggle() {
    this.sayHello = !this.sayHello;
  }
}
