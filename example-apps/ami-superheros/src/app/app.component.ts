import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Router } from '@angular/router';

import { GameService } from './game.service';
import HerosService from './heros.service';
import VillansService from './villans.service';

import Home from './home/home.component';
import About from './about/about.component';
import Game from './game/game.component';
import Scores from './scores/scores.component';

@Component({
  selector: 'ami-superheros-app',
  providers: [ROUTER_PROVIDERS, HerosService, VillansService, GameService],
  templateUrl: 'app.component.html',
  styles: [`
    .row {
      display: flex;
      margin-top: 0.5rem;
    }
  `]
})
@RouteConfig([
  { path: '/', component: Home, as: 'Home' },
  { path: '/games/:count', component: Game, as: 'Game' },
  { path: '/about', component: About, as: 'About' },
  { path: '/scores/:type', component: Scores, as: 'Scores' },
])
export default class AmiSuperherosApp {
  constructor(
    private router: Router
  ) { }
}
