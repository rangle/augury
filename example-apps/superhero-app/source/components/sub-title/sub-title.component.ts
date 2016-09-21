import {Component} from '@angular/core';

@Component({
  selector: 'sub-title',
  styles: [`
    p {
      text-align: center;
    }
    .sub-title {
        margin: 0px;
        padding: 0px;
        font-size: 35px;
        font-weight: 400;
        letter-spacing: 0.02em;
    }
  `],
  template: `
    <p class="sub-title">Superhero Tinder</p>
    <p>Are you fly enough to be matched up?</p>
  `
})
export class SubTitleComponent {
}
