import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GameService } from '../../services/game.service';

@Component({
  selector: 'scores',
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
      <tr *ngFor="let score of scores">
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
export class ScoresComponent {
  private scores: any;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    this.scores = gameService.getScores();
  }

  onClick(count: any) {
    this.router.navigateByUrl('/game/' + count);
  }
}
