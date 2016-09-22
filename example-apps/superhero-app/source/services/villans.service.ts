import { Injectable } from '@angular/core';

import { VILLANS } from '../constants/villans';

@Injectable()
export class VillansService {

  getRandomVillan(): string {
    const random: number = parseInt(Math.random() * VILLANS.length + '', 10);
    return VILLANS[random];
  }

  isVillan(name: string): boolean {
    return VILLANS.indexOf(name) > -1;
  }
}
