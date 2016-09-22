import { Injectable } from '@angular/core';

import { HEROS } from '../constants/heros';

@Injectable()
export class HerosService {

  getRandomHero(): string {
    const random: number = parseInt(Math.random() * HEROS.length + '', 10);
    return HEROS[random];
  }

  isHero(name: string): boolean {
    return HEROS.indexOf(name) > -1;
  }
}
