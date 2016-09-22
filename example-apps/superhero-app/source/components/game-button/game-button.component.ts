import {Component, EventEmitter} from '@angular/core';

@Component({
  selector: 'game-button',
  inputs: ['label', 'type'],
  outputs: ['onClick'],
  styles: [ `
    .button {
      border: none;
      border-radius: 3px;
      color: white;
      font-weight: bold;
      letter-spacing: .2em;
      margin-left: 0.5rem;
      padding: 1rem;
      text-transform: uppercase;
      background: #E5373A;
      font-size: 20px;
    }
    .button-green {
      background: #009100;
    }
  `],
  template: `
    <button
      class="button"
      [ngClass]="{'button-green': type == true}"
      (click)="onClick.emit(type)">
      {{label}}
    </button>
  `
})
export class GameButtonComponent {
  onClick = new EventEmitter();
}
