import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameService, Character } from '../../services/game.service';

@Component({
  selector: 'game',
  styles: [`
    .content-container {
      text-align: center;
      padding: 50px 0;
      vertical-align: middle;
      font-size: 0;
      box-sizing: border-box;
    }
    img {
      max-width: 300px;
      max-height: 400px;
      vertical-align: middle;
      padding: 0 50px;
    }
    .msg {
      font-size: 30px;
      text-align: center;
      color: #DB4C2C;
    }
    start-button {
      padding-top: 50px;
    }
    swipe {
      width: 25%;
      box-sizing: border-box;
    }
    p {
      text-align: center;
      font-size: 30px;
      margin-top: 0;
    }
  `],
  template: `
    <game-title [title]="character.name"></game-title>
    <div class="content-container">
      <swipe [direction]="'left'" (onClick)="handleSwipe($event)" [hidden]="guessed || gameOver"></swipe>
      <img [src]="character.img" />
      <swipe [direction]="'right'" (onClick)="handleSwipe($event)" [hidden]="guessed || gameOver"></swipe>
    </div>
    <p class="msg">{{msg}}</p>
    <p [hidden]="guessed || gameOver">Swipe left or right</p>
    <div style="text-align: center;"
      *ngIf="gameOver">
      <h2>Click to play again or view High Scores</h2>
      <start-button
        [label]="'Try Again'"
        [count]="5"
        (onClick)="startAnotherGame($event)">
      </start-button>
      <scores-button
        [url]="'/scores/all'"
        [label]="'View Matches'">
      </scores-button>
    </div>
    <div class="spacer" style="height: 100px;"></div>
  `
})
export class GameComponent {

  private count: number;
  private countParam: number;
  private paramSub: any;
  private character: Character;
  private gameOver: boolean = false;
  private msg: string = "";
  private guessed: boolean = false;

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
      this.character = this.gameService.getCharacterByIndex(this.count);
    });
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
  }

  startAnotherGame() {
    this.gameOver = false;
    this.guessed = false;
    this.count = 0;
    this.msg = "";
    this.gameService.startGame(this.countParam);
    this.character = this.gameService.getCharacterByIndex(this.count);
  }

  handleSwipe(doesLikeCharacter: boolean){

    this.guessed = true;

    if (doesLikeCharacter && this.character.likesMe) {
      this.character.match = true;
      this.msg = "It's a match!";
    }

    if (this.count < this.countParam - 1) {
      if(this.character.match){
        setTimeout(this.loadNextCharacter.bind(this), 1500);
      }
      else {
        this.loadNextCharacter();
      }
    } else {
      this.gameOver = true;
    }
  }

  loadNextCharacter(){
    this.count++;
    this.msg = "";
    this.guessed = false;
    this.character = this.gameService.getCharacterByIndex(this.count);
  }

}
