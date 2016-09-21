import {Inject, Injectable} from '@angular/core';
import { CharacterService } from './character.service';

export interface Character {
  name: string;
  img: string;
  likesMe: boolean;
  match: boolean;
}

@Injectable()
export class GameService {

  private characters: Array<Character>;
  private count: number;

  constructor(
    @Inject(CharacterService) private characterService: CharacterService
  ) { }

  startGame(count: number): void {
    this.count = count;
    this.characters = new Array<Character>();
    for (let i = 0; i < count; i++) {
      let likesMe = Math.random() > 0.5;
      let character = this.characterService.getRandomCharacter();
      let name = character.name || character.aliases;
      let img = character.image && character.image.medium_url ?
                character.image.medium_url :
                "http://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716";

      this.characters.push({
        name: name,
        img: img,
        likesMe: likesMe,
        match: undefined
      });
    }
  }


  getCharacterByIndex(index: number): Character {
    return this.characters[index];
  }

  getMatches(): Array<any> {
    if (this.characters) {
      return this.characters.filter((character) => character.match === true);
    } else {
      return [];
    }
  }
}
