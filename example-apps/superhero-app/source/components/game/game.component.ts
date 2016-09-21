import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService, Player } from '../../services/game.service';

@Component({
  selector: 'game',
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
    <div style="text-align: center; margin: 25px; padding-top: 30px;">
      <game-button
        [hidden]="gussed" 
        [label]="'Yes'"
        [type]="true"
        (onClick)="makeGuess($event)">
      </game-button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <game-button
      [hidden]="gussed"
      [label]="'No'"
      [type]="false"
      (onClick)="makeGuess($event)">
      </game-button>
    </div>
    <div style="text-align: center; margin: 25px; padding-top: 30px;"
      *ngIf="gameOver">
      <h2>Click to play again or view High Scores</h2>
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
})
export class GameComponent {

  private count: number;
  private countParam: number;
  private paramSub: any;
  private player: Player;
  private gussed: boolean = false;
  private msg: string = '';
  private title: string;
  private gameOver: boolean = false;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {
    this.gameOver = false;
    this.count = 0;
  }

  ngOnInit() {
    this.paramSub = this.route.params.subscribe(params => {
      this.countParam = +params['count'];
      this.gameService.startGame(this.countParam);
      this.player = this.gameService.getPlayerByIndex(this.count);
      this.title = 'Is ' + this.player.name + ' Superhero?';
    });
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
  }

  onClick(count: any) {
    this.gameOver = false;
    this.gussed = false;
    this.count = 0;
    this.msg = '';
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
    if (this.count < this.countParam - 1) {
      setTimeout(this.nextGuess.bind(this), 1500);
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
