import {Injectable} from 'angular2/core';

import {VILLANS} from '../constants/villans';

@Injectable()
export default class VillansService {

  getRandomVillan(): string {
    const random: number = parseInt(Math.random() * VILLANS.length + '');
    return VILLANS[random];
  }

  isVillan(name: string): boolean {
    return VILLANS.indexOf(name) > -1;
  }
}
