import {Component, Input} from '@angular/core';
import {FORM_PROVIDERS, REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup}
 from '@angular/forms';


// StressComponent wraps a list item around an Angular 2 component
// for Augury to detect.
@Component({
  selector: 'stress-item',
  template: `
    <li>{{value}}</li>
  `
})
export class StressItem {
  @Input() value: number;
}

@Component({
  selector: 'stress-rec-item',
  directives: [StressRecItem],
  template: `
    <ul>
        <li>{{value}}</li>
        <li *ngIf="value > 0">
            <stress-rec-item [value]="value"></stress-rec-item>
        </li>  
    </ul>
  `
})
export class StressRecItem {
  @Input() value: number;
  ngOnInit() {
    this.value -= 1;
  }
}

@Component({
  selector: 'stress-tester',
  providers: [FORM_PROVIDERS],
  directives: [REACTIVE_FORM_DIRECTIVES, StressRecItem, StressItem],
  template: `
  <div>
    <p>Deep Tree Test</p>
    <form (submit)="onSubmitRec()" novalidate>
      <div>
        <label for="node-count">Specify Depth of Tree: </label>
        <input type="number" id="node-count" [formControl]="count">
      </div>
      <button type="submit">Run</button>
    </form>
    <br>
    <div *ngIf="value">
      <stress-rec-item [value]="value"></stress-rec-item>
    </div>
    <div>
      <p>Single parent many children test.</p>
      <form (submit)="onSubmit()" novalidate>
        <div>
          <label for="node-count">Specify number of children: </label>
          <input type="number" id="node-count" [formControl]="nodeCount">
        </div>
        <button type="submit">Run</button>
      </form>
      <br>
      <div *ngIf="values">
        <stress-item *ngFor="let i of values" [value]="i"></stress-item>
      </div>
    </div>
  </div>
  `
})
export class StressTester {
  private count: FormControl = new FormControl();
  private nodeCount: FormControl = new FormControl();

  private value: number;
  private values = [];
  onSubmit() {
    this.values = [];
    for (let i = 0; i < this.nodeCount.value; i++) {
      this.values.push(i);
    }
  }

  onSubmitRec() {
    this.value = this.count.value;
  }
}
