import { CHARACTERS } from '../constants/characters';
import { Injectable } from '@angular/core';

@Injectable()
export class CharacterService {

  getRandomCharacter(): any {
    const random: number = Math.floor(Math.random() * (CHARACTERS.results.length - 1));
    return CHARACTERS.results[random];
  }
}
