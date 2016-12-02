import { Component,
         EventEmitter,
         Input,
         Output } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <h3>Count: {{ count }}</h3>
    <button (click)="onDecrement()" class="btn btn-primary">
      -
    </button>
    <button (click)="onIncrement()" class="btn btn-primary">
      +
    </button>
  `,
  styles: []
})
export class CounterComponent {

  @Input() count: number = 0;
  @Output() countEvent: EventEmitter<number> = new EventEmitter<number>();

  onIncrement() {
    this.count++;
    this.countEvent.emit(this.count);
  }

  onDecrement() {
    this.count--;
    this.countEvent.emit(this.count);
  }
}
