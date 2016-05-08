import {Component} from 'angular2/core';
import {Router} from 'angular2/router';

import StartButton from '../home/start-button';
import HomeButton from './home-button';
import ScoreFilterButton from './score-filter-button';

import {GameService, Player} from '../../services/game-service';
import HerosService from '../../services/heros-service';
import VillansService from '../../services/villans-service';

import GameTitle from '../game/game-title';

@Component({
  selector: 'scores',
  directives: [GameTitle, StartButton, HomeButton, ScoreFilterButton],
  providers: [HerosService, VillansService, GameService],
  styles: [`
    table, td, th {
        font-size: 20px;
        border: 1px solid white;
        padding: 10px;
    }

    table {
        border-collapse: collapse;
        width: 50%;
        margin: auto;
    }

    th {
        height: 50px;
    }
  `],
  template: `
    <game-title
      [title]="'Current Game Score'">
    </game-title>
    <h1 style="text-align: center;">Game {{scores.length}}: {{gameService.getScore()}}</h1>
    <div style="text-align: center;margin: 20px;">
      <score-filter-button
        (onClick)="showScores($event)"
        [selected]="!scoresCount"
        [label]="'All'">
      </score-filter-button>
      <score-filter-button 
        (onClick)="showScores($event)"
        [selected]="scoresCount == 10"
        [label]="'First 10'"
        [count]="'10'">
      </score-filter-button>
      <score-filter-button 
        (onClick)="showScores($event)"
        [selected]="scoresCount == 20"
        [label]="'First 20'"
        [count]="'20'">
      </score-filter-button>
    </div>
    <table>
      <tr>
        <th>Game</th>
        <th>Score</th>
      </tr>
      <tr *ngFor="#score of scores">
        <td>{{score.game}}</td>
        <td>{{score.score}}</td>
      </tr>
    </table>
    <div style="text-align: center; margin: 25px; padding-top: 30px;">
      <home-button
        [label]="'Home'"
        [url]="'/'">
      </home-button>
      <start-button
        [label]="'Play Again'"
        [count]="3"
        (onClick)="onClick($event)">
      </start-button>
    </div>
  `
})
export default class Scores {
  private scores: any;
  private scoresCount = undefined;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    this.showScores(this.scoresCount);
  }

  showScores(data) {
    this.scoresCount = data;
    this.scores = this.gameService.getScores(data);
  }

  onClick(count: any) {
    this.router.navigate( ['Game', { count: count }] );
  }
}
