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

  setExperience(wasGoodExperience: boolean, chosen, other) {
    this._overallExperience = wasGoodExperience ?
      Experience.Good :
      Experience.Bad;
    chosen.setAttribute('class', 'selected');
    other.setAttribute('class', '');
  }

  get rating() {
    return this._overallExperience;
  }

  public resetRating() {
    this._overallExperience = Experience.Unspecified;
  }
}
