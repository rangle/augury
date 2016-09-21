import {Component} from '@angular/core';

@Component({
  selector: 'game-title',
  inputs: ['title'],
  styles: [`
    .title {
      display: block important;
      text-align: center;
      margin: 0px;
      padding: 0px;
      font-weight: 600;
      letter-spacing: 0.02em;
      font-size: 40px;
      padding-top: 30px;
    }
  `],
  template: `
    <p class="title">{{title}}</p>
  `
})
export class GameTitleComponent {
}
