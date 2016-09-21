import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'home',
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
export default class HomeComponent {

  constructor(
    private router: Router
  ) { }

  onClick(count: any) {
    this.router.navigate( ['Game', { count: count }] );
  }

}
