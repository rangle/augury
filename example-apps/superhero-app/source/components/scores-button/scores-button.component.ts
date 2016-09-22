import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'scores-button',
  inputs: ['label', 'url'],
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
  `],
  template: `
    <button
      (click)="onClick()"
      class="button">
      {{label}}
    </button>
  `
})
export class ScoresButtonComponent {
  private url: string;
  constructor(
    private router: Router
  ) { }

  onClick() {
    this.router.navigateByUrl(this.url);
  }
}
