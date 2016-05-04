import {Component, EventEmitter} from 'angular2/core';

@Component({
  selector: 'score-filter-button',
  inputs: ['label', 'count', 'selected'],
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
      background: #000;
      font-size: 16px;
    }
    .button-selected {
      background: #E5373A;
    }
  `],
  template: `
    <button
      (click)="onClick.emit(count)"
      [ngClass]="{'button-selected': selected == true}"
      class="button">
      {{label}}
    </button>
  `
})
export default class ScoreFilterButton {
  onClick = new EventEmitter();
}
