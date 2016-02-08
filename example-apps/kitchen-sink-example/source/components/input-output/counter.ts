import {Component, EventEmitter} from 'angular2/core';

@Component({
  selector: 'counter',
  inputs: ['count'],
  outputs: ['result'],
  template: `
    <div>
      <h4>Count: {{ count }}</h4>
      <button class="btn btn-primary" (click)="increment()">Increment</button>
    </div>
  `
})
export default class Counter {
  count: number = 0;
  result: EventEmitter<number> = new EventEmitter<number>();

  increment() {
    this.count++;
    this.result.emit(this.count);
  }
}
