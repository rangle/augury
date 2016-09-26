import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'home',
  styles: [`
    img {
      position: relative;
      left: -20px;
    }
    start-button {
      display: block;
      padding: 50px 0;
    }
    img {
      padding-top: 60px;
    }
  `],
  template: `
    <game-title></game-title>
    <sub-title></sub-title>
    <div style="text-align: center;margin: 25px;">
      <img src="https://3.bp.blogspot.com/-VL23NLfTy2s/VrDTvWaMKiI/AAAAAAAAQdU/C0dsq5B_O8I/s400/deadpool-movie-2016-5k-wallpaper-5120x2880.jpg" />
      <start-button
        [label]="'Get Matching'"
        [count]="5"
        (onClick)="onClick($event)">
      </start-button>
    </div>
  `
})
export class HomeComponent {

  constructor(
    private router: Router
  ) { }

  onClick(count: any) {
    this.router.navigateByUrl('/game/' + count);
  }

}
