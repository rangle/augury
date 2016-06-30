import {Component} from '@angular/core';

@Component({
   selector: 'ngclass-directive',
   inputs: ['isDisabled'],
  template: `
     <div class="button"
       [ngClass]="{active: isOn, disabled: isDisabled}"
         (click)="toggle(!isOn)">
         <h4>Click me!</h4>
     </div>`,
  styles: [`
    .button {
      padding: 10px;
      border: medium solid black;
    }

    .active {
      background-color: red;
    }

    .disabled {
      color: gray;
      border: medium solid gray;
    }
  `]
})
export default class NgClassDirective {
  isOn = false;
  isDisabled = false;

  toggle(newState) {
    if (!this.isDisabled) {
      this.isOn = newState;
    }
  }
}
