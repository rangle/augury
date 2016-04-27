import {Component} from 'angular2/core';

@Component({
  selector: 'sub-title',
  styles: [`
    .sub-title {
        text-align: center;
        margin: 0px;
        padding: 0px;
        font-size: 35px;
        font-weight: 400;
        letter-spacing: 0.02em;
    }
  `],
  template: `
    <p class="sub-title">simply guess the superhero or villan and win!!!</p>
  `
})
export default class SubTitle {
}
