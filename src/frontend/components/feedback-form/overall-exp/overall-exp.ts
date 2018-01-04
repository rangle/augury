import {Input, Component} from '@angular/core';

import {Options, Theme} from '../../../state';

export enum Experience {
  Good,
  Bad,
  Unspecified,
}


@Component({
  selector: 'bt-overall-exp-control',
  template: require('./overall-exp.html'),
  styles: [require('to-string!./overall-exp.css')],
  host: {
    '[class.dark]': 'isDarkTheme()'
  }
})

export class OverallExpControl {
  @Input() private isDarkTheme;

  private _overallExperience: Experience = Experience.Unspecified;

  constructor(private options: Options) {
  }

  setExperience(wasGoodExperience: boolean) {
    this._overallExperience = wasGoodExperience ?
      Experience.Good :
      Experience.Bad;
  }

  get rating() {
    return this._overallExperience;
  }

  get isGood() {
    return this._overallExperience === Experience.Good;
  }

  get isBad() {
    return this._overallExperience === Experience.Bad;
  }

  public resetRating() {
    this._overallExperience = Experience.Unspecified;
  }
}
