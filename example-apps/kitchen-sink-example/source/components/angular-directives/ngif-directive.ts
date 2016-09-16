import {Component} from '@angular/core';

@Component({
  selector: 'ngif-directive',
  template: `
  <div>
    <hello-directives msg="Hello from John!!" *ngIf="sayHello">
    </hello-directives>

    <hello-directives msg="Hi from John!!" *ngIf="!sayHello">
    </hello-directives>

    <button class="btn btn-primary"
       (click)="toggle()">
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
