import {Component} from 'angular2/core';
import {Router} from 'angular2/router';

import GameTitle from './game-title';
import SubTitle from './sub-title';
import StartButton from './start-button';

@Component({
  selector: 'home',
  directives: [GameTitle, SubTitle, StartButton],
  template: `
    <game-title></game-title>
    <sub-title></sub-title>
    <div style="text-align: center;margin: 25px;">
      <start-button
        [label]="'Start Game'"
        [count]="3"
        (onClick)="onClick($event)">
      </start-button>
      <br/>
      <br/>
      <br/>
      <img src="http://images.clipartpanda.com/superhero-clip-art-superhero-clipart-3a.png" />
    </div>
  `
})
export default class Home {

  constructor(
    private router: Router
  ) { }

  onClick(count: any) {
    this.router.navigate( ['Game', { count: count }] );
  }

}
