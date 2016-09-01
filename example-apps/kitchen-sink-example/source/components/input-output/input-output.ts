import {Component, Input} from '@angular/core';
import Counter from './counter';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'input-output',
  template: `
    <h4>Parent Num: {{ num }}</h4>
    <h4>Parent Count: {{ parentCount }}</h4>
    <counter [count]="num"
      (result)="onChange($event)"
      (displayMessage)="displayMessage($event)">
    </counter>

    <h3 *ngIf="name && message">
      <hr/>
      {{name}}: {{message}}
    </h3>

    <hr/>

    <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
      (click)="toggle(!isOn)">
        <h4>Click me!</h4>
    </div>
  `,
   styles: [`
    .button {
      padding: 5px;
      width: 120px;
      border: medium solid black;
      color: white;
      background-color: #e08600;
    }
    .button h4 {
      color: #fff;
    }
    .active {
      background-color: #0d87e9;
      color: white;
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
