import {Component, EventEmitter} from '@angular/core';

@Component({
  selector: 'start-button',
  inputs: ['label', 'count'],
  outputs: ['onClick'],
  styles: [ `
    .button {
      border: none;
      border-radius: 3px;
      color: white;
      font-weight: bold;
      letter-spacing: .2em;
      margin-left: 0.5rem;
      padding: 0.5rem;
      text-transform: uppercase;
      background: #E5373A;
      font-size: 16px;
    }
  `],
  template: `
    <button
      class="button"
      (click)="onClick.emit(count)">
      {{label}}
    </button>
  `
})
export class StartButtonComponent {
  onClick: EventEmitter<number> = new EventEmitter();
}
