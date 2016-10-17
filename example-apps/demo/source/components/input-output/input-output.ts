import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'input-output',
  template: `
  <h3>@Input and @Output</h3>
  <div class="panel-body">
    <h4>Parent Num: {{ num }}</h4>
    <h4>Parent Count: {{ parentCount }}</h4>
    <counter [count]="num"
      (resultChanged)="onChange($event)"
      (displayMessage)="displayMessage($event)">
    </counter>

    <h3 *ngIf="name && message">
      <hr/>
      {{name}}: {{message}}
    </h3>

    <hr>

    <button
      class="btn"
      [ngClass]="{'btn-warning': isOn, 'btn-primary': !isOn, disabled: isDisabled}"
      (click)="toggle(!isOn)">
        Toggle me.
    </button>
  </div>
  `,
})
export class InputOutput {
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

  displayMessage({message, name}) {
    this.message = message;
    this.name = name;
  }
}

@Component({
  selector: 'counter',
  template: `
    <div>
      <h4>Count: {{ count }}</h4>
      <button class="btn btn-primary" (click)="increment()">
        increment counter
      </button>
      <button class="btn btn-warning" (click)="sendMessage()">
        send message
      </button>
    </div>
  `
})
export class Counter {
  @Input() count: number = 0;
  @Output('resultChanged') resultEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() displayMessage: EventEmitter<any> = new EventEmitter<any>();

  increment() {
    this.count++;
    this.resultEmitter.emit(this.count);
  }

  sendMessage() {
    const data = { 'name': 'Counter says', 'message': 'Hello, folks.' };
    this.displayMessage.emit(data);
  }
}
