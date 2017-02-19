import {Inject, Injectable} from '@angular/core';

import HerosService from './heros.service';
import VillansService from './villans.service';

export interface Player {
  name: string;
  isHero: boolean;
  correct: boolean;
}

@Injectable()
export class GameService {

  private players: Array<Player>;
  private count: number;

  constructor(
    @Inject(HerosService) private herosService: HerosService,
    @Inject(VillansService) private villansService: VillansService
  ) { }

  startGame(count: number): void {
    this.count = count;
    this.players = new Array<Player>();
    for (let i = 0; i < count; i++) {
      const random = parseInt(Math.random() * 10 + '');
      if (random % 2) {
        this.players.push({
          name: this.herosService.getRandomHero(),
          isHero: true,
          correct: undefined
        });
      } else {
        this.players.push({
          name: this.villansService.getRandomVillan(),
          isHero: false,
          correct: undefined
        });
      }
    }
  }

  getScore(): number {
    if (this.players) {
      return this.players.filter((player) => player.correct === true).length;
    } else {
      return undefined;
    }
  }

  getScores() {
    return JSON.parse(localStorage.getItem('scores'));
  }

  getPlayerByIndex(index: number): Player {
    return this.players[index];
  }

  saveScore(score: number) {
    let scores = [];
    if (localStorage.getItem('scores')) {
      scores = JSON.parse(localStorage.getItem('scores'));
    }
    scores.push({
      'game': 'Game ' + (scores.length + 1),
      'score': score
    });
    localStorage.setItem('scores', JSON.stringify(scores));
  }

}
