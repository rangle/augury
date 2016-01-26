import {Component, EventEmitter} from 'angular2/core';

@Component({
  selector: 'counter',
  inputs: ['count'],
  outputs: ['result'],
  template: `
    <div>
      <p>Count: {{ count }}</p>
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
