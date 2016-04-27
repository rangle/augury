import {Component} from 'angular2/core';
import {Router} from 'angular2/router';

import StartButton from '../home/start-button';

import {GameService, Player} from '../../services/game-service';
import HerosService from '../../services/heros-service';
import VillansService from '../../services/villans-service';

import GameTitle from '../game/game-title';

@Component({
  selector: 'scores',
  directives: [GameTitle, StartButton],
  // providers: [HerosService, VillansService, GameService],
  styles: [`
    table, td, th {
        border: 1px solid white;
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
    <h4 style="text-align: center;">Game {{scores.length}}: {{gameService.getScore()}}</h4>
    <game-title
      [title]="'All Time Score'">
    </game-title>
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

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    this.scores = gameService.getScores();
  }

  onClick(count: any) {
    this.router.navigate( ['Game', { count: count }] );
  }
}
