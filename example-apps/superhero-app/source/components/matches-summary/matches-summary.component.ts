import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GameService } from '../../services/game.service';

@Component({
  selector: 'matches-summary',
  styles: [`
    table, td, th {
        border: 1px solid white;
        text-align: center;
    }
    p {
      font-size: 30px;
      text-align: center;
      padding-top: 100px;
      padding-bottom: 50px;
    }

    table {
        border-collapse: collapse;
        width: 50%;
        margin: auto;
    }

    th {
        height: 50px;
        width: 50%;
    }
    td {
      width: 200px;
      padding: 20px;
      font-size: 24px;
    }
    img {
      width: 100%;
    }
  `],
  template: `
    <game-title
      [title]="'Your Matches '">
    </game-title>
    
    <div *ngIf="matches.length > 0">
      <table> 
        <tr *ngFor="let match of matches">
          <td> 
            <img [src]="match.img" />
          </td>
          <td>
            {{match.name}}
          </td>
        </tr>
      </table>
    </div>
    <p *ngIf="matches.length == 0">
      Sorry, you have no matches :(
    </p>
    
    <div style="text-align: center;">
      <start-button
        [label]="'Play Again'"
        [count]="5"
        (onClick)="onClick($event)">
      </start-button>
    </div>
    <div class="spacer" style="height: 100px;"></div>
  `
})
export class MatchesSummaryComponent {
  private matches: Array<any>;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    this.matches = gameService.getMatches();
  }

  onClick(count: any) {
    this.router.navigateByUrl('/game/' + count);
  }
}
