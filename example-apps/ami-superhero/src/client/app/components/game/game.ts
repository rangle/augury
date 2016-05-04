import {Component} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {Router} from 'angular2/router';

import GameTitle from './game-title';
import GameButton from './game-button';
import StartButton from '../home/start-button';
import ScoresButton from './scores-button';
import HomeButton from '../scores/home-button';

import {GameService, Player} from '../../services/game-service';
import HerosService from '../../services/heros-service';
import VillansService from '../../services/villans-service';

@Component({
  selector: 'game',
  directives: [GameTitle, GameButton, ScoresButton, StartButton, HomeButton],
  styles: [`
    .label {
      text-align: center;
      margin-top: 0px;
      padding: 10px;
      font-size: 35px;
      font-weight: 400;
      letter-spacing: 0.02em;
      background: #fff;
    }
    .label-success {
      color: #009100;
    }
    .label-error {
      color: #E5373A;
    }
  `],
  template: `
    <game-title 
      [title]="title">
    </game-title>
    <div style="text-align: center; margin: 25px; padding-top: 30px;">
    <label
      [hidden]="msg.length == 0"
      class="label"
      [ngClass]="{'label-success': player.correct,
      'label-error': !player.correct}">{{msg}}</label>
    </div>
    <div style="text-align: center; margin: 25px; padding-top: 30px;" *ngIf="!gussed">
      <game-button
        [label]="'Yes'"
        [type]="true"
        (onClick)="makeGuess($event)">
      </game-button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <game-button
      [label]="'No'"
      [type]="false"
      (onClick)="makeGuess($event)">
      </game-button>
    </div>
    <div style="text-align: center; margin: 25px; padding-top: 30px;"
      *ngIf="gameOver">
      <h1>Click to play again or view High Scores</h1>
      <home-button
        [label]="'Home'"
        [url]="'/'">
      </home-button>
      <start-button
        [label]="'Play Again'"
        [count]="3"
        (onClick)="onClick($event)">
      </start-button>
      <scores-button
        [url]="'/scores/all'"
        [label]="'View Scores'">
      </scores-button>
    </div>
  `,
  // providers: [HerosService, VillansService, GameService],
})
export default class Game {

  private count: number;
  private player: Player;
  private gussed: boolean = false;
  private msg: string = '';
  private title: string;
  private gameOver: boolean = false;

  constructor(
    private gameService: GameService,
    private params: RouteParams,
    private router: Router
  ) {
    this.gameOver = false;
    this.count = 0;
    gameService.startGame(parseInt(this.params.get('count')));
    this.player = gameService.getPlayerByIndex(this.count);
    this.title = 'Is ' + this.player.name + ' Superhero?';
  }

  onClick(count: any) {
    this.gameOver = false;
    this.gussed = false;
    this.count = 0;
    this.msg = '';
    this.gameService.startGame(parseInt(this.params.get('count')));
    this.player = this.gameService.getPlayerByIndex(this.count);
    this.title = 'Is ' + this.player.name + ' Superhero?';
  }

  makeGuess(guess: boolean) {
    this.gussed = true;
    if (guess === this.player.isHero) {
      this.msg = 'You guessed wrong try next';
      this.player.correct = false;
    } else {
      this.msg = 'Good try next one';
      this.player.correct = true;
    }
    if (this.count < parseInt(this.params.get('count')) - 1) {
      setTimeout(this.nextGuess.bind(this), 1000);
    } else {
      this.gameService.saveScore(this.gameService.getScore());
      this.gameOver = true;
    }
  }

  nextGuess() {
    this.count++;
    this.player = this.gameService.getPlayerByIndex(this.count);
    this.title = 'Is ' + this.player.name + ' Superhero?';
    this.gussed = false;
    this.msg = '';
  }



}
