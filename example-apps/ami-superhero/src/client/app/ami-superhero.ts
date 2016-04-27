import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Router}
  from 'angular2/router';

import {GameService, Player} from './services/game-service';
import HerosService from './services/heros-service';
import VillansService from './services/villans-service';

import Home from './components/home/home';
import About from './components/about/about';
import Game from './components/game/game';
import Scores from './components/scores/scores';

@Component({
  selector: 'ami-superhero-app',
  providers: [ROUTER_PROVIDERS, HerosService, VillansService, GameService],
  // providers: [ROUTER_PROVIDERS],
  templateUrl: 'app/ami-superhero.html',
  directives: [ROUTER_DIRECTIVES],
  pipes: [],
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
export class AmiSuperheroApp {
  constructor(
    private router: Router
  ) { }
}
