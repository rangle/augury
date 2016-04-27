import {Component} from 'angular2/core';

@Component({
  selector: 'game-title',
  styles: [`
    .title {
      display: block important;
      text-align: center;
      margin: 0px;
      padding: 0px;
      font-weight: 600;
      letter-spacing: 0.02em;
      font-size: 70px;
      padding-top: 30px;
    }
  `],
  template: `
    <p class="title">Superhero Or Villan</p>
  `
})
export default class GameTitle {
}
