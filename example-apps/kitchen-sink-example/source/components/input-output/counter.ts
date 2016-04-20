import {Component, EventEmitter, Output} from 'angular2/core';

@Component({
  selector: 'counter',
  inputs: ['count'],
  outputs: ['result', 'displayMessage'],
  template: `
    <div>
      <h4>Count: {{ count }}</h4>
      <button class="btn btn-primary" (click)="increment()">
        Increment
      </button>
      <button class="btn btn-warning" (click)="sendMessage()">
        SendMessage
      </button>
    </div>
  `
})
export default class Counter {
  count: number = 0;
  result: EventEmitter<number> = new EventEmitter<number>();
  displayMessage: EventEmitter<any> = new EventEmitter<any>();

  increment() {
    this.count++;
    this.result.emit(this.count);
  }

  sendMessage() {
    const data = { 'name': 'John11', 'message': 'Hello there11!!!' };
    this.displayMessage.emit(data);
  }
}
