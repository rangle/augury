import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-messageboard',
  template: `
    <h1>{{message}}</h1>
  `,
  styles: []
})
export class MessageBoardComponent {
  @Input() message: string;
}
