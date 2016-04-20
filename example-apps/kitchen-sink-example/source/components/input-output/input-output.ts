import {Component, Input} from 'angular2/core';
import Counter from './counter';
import {NgClass, NgIf} from 'angular2/common';

@Component({
  selector: 'input-output',
  template: `
    <div>
        <h4>Parent Num: {{ num }}</h4>
        <h4>Parent Count: {{ parentCount }}</h4>
        <counter [count]="num" 
          (result)="onChange($event)"
          (displayMessage)="displayMessage($event)"
        ></counter>
        {{name}}: {{message}}
    </div>
    <br/>
    <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
      (click)="toggle(!isOn)">
        Click me!
    </div>
    <br/>
    <div *ngIf="turn">
        <h4>it's true</h4>
    </div>
  `,
   styles: [`
    .button {
      padding: 5px;
      width: 120px;
      border: medium solid black;
    }
    .active {
      background-color: red;
    }
    .disabled {
      color: gray;
      border: medium solid gray;
    }
  `],
  directives: [Counter, NgClass, NgIf]
})
export default class InputOutput {
  message: string;
  name: string;
  num: number;
  parentCount: number;
  isOn = false;
  isDisabled = false;
  turn = true;

  constructor() {
    this.num = 0;
    this.parentCount = 0;
  }

  onChange(val: any) {
    this.parentCount = val;
  }

  toggle(newState) {
    if (!this.isDisabled) {
      this.isOn = newState;
    }
  }

  displayMessage(data: any) {
    this.message = data.message;
    this.name = data.name;
  }
}
