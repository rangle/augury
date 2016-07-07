import {Component} from '@angular/core';
import {FORM_DIRECTIVES, NgForm, NgIf} from '@angular/common';

// StressComponent wraps a list item around an Angular 2 component
// for Augury to detect.
@Component({
  selector: 'stress-item',
  inputs: ['value'],
  template: `
    <li>{{value}}</li>
  `
})
class StressItem {
}

//
@Component({
  selector: 'stress-tester',
  directives: [FORM_DIRECTIVES, NgForm, StressItem],
  template: `
    <p>Stress test Augury by adding values to the list. 
     Warning: may crash Augury and/or Chrome.</p>
    <form #regForm="ngForm" (ngSubmit)="onSubmit(regForm)" novalidate>
      <div>
        <label for="node-count">Specify number of values: </label>
        <input type="number" id="node-count" ngControl="count">
      </div>
      <button type="submit">Add</button>
    </form>
    <br>
    <h4>List of values</h4>
    <ul>
      <stress-item *ngFor="let val of values" value="{{val}}"></stress-item>
      <li *ngIf="values.length === 0">
        Hint: type a number and click Add above.
      </li>
    </ul>
  `
})
export default class StressTester {
  values: any = [];

  // onSubmit make an array of the specified count. Each element will result in
  // a new Angular 2 component.
  onSubmit(regForm: NgForm) {
    let maxCount = regForm.value.count;
    for (let i = 0; i < maxCount; i++) {
      this.values.push(i);
    }
  }
}
