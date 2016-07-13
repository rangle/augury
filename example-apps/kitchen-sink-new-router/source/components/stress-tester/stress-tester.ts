import {Component, Input} from '@angular/core';
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

@Component({
  selector: 'stress-rec-item',
  inputs: ['value'],
  directives: [NgIf, StressRecItem],
  template: `
    <ul>
        <li>{{value}}</li>
        <li *ngIf="value > 0">
            <stress-rec-item [value]="value"></stress-rec-item>
        </li>  
    </ul>
  `
})
class StressRecItem {
  @Input() value: number;
  ngOnInit() {
    this.value -= 1;
  }
}

@Component({
  selector: 'stress-tester',
  directives: [FORM_DIRECTIVES, NgForm, StressRecItem, StressItem],
  template: `
  <div>
    <p>Deep Tree Test</p>
    <form #regFormRec="ngForm" (ngSubmit)="onSubmitRec(regFormRec)" novalidate>
      <div>
        <label for="node-count">Specify Depth of Tree: </label>
        <input type="number" id="node-count" ngControl="count">
      </div>
      <button type="submit">Run</button>
    </form>
    <br>
    <div *ngIf="value" [hidden]="value">
      <stress-rec-item [value]="value"></stress-rec-item>
    </div>
    <div>
      <p>Single parent many children test.</p>
      <form #regForm="ngForm" (ngSubmit)="onSubmit(regForm)" novalidate>
        <div>
          <label for="node-count">Specify number of children: </label>
          <input type="number" id="node-count" ngControl="count">
        </div>
        <button type="submit">Run</button>
      </form>
      <br>
      <div *ngIf="values" [hidden]="values">
        <stress-item *ngFor="let i of values" [value]="i"></stress-item>
      </div>
    </div>
  </div>
  `
})
export default class StressTester {
  private value: number;
  private values = [];
  onSubmit(regFormRec: NgForm) {
    for (let i = 0; i < regFormRec.value.count; i++) {
      this.values.push(i);
    }
  }
  
  onSubmitRec(regForm: NgForm) {
    this.value = regForm.value.count;
  }
}
