import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-messageboard',
  template: `
    <h1>{{message}}</h1>
  `,
  styles: [`
    border: 2px;
  `]
})
export class MessageBoardComponent {
  @Input() message: string;
}
