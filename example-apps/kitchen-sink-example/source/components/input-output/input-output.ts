import {Component, Input} from 'angular2/core';
import Counter from './counter';

@Component({
  selector: 'input-output',
  template: `
    <div>
      Parent Num: {{ num }} <br />
      Parent Count: {{ parentCount }}
      <counter [count]="num" 
        (result)="onChange($event)">
      </counter>
    </div>
  `,
  directives: [Counter]
})
export default class InputOutput {
  num: number;
  parentCount: number;

  constructor() {
    this.num = 0;
    this.parentCount = 0;
  }

  onChange(val: any) {
    this.parentCount = val;
  }
}
