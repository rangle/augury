import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'swipe',
  template: `
    <img src="http://image.flaticon.com/icons/svg/45/45271.svg"
          [class]="direction" 
           (click)="onClick.emit(likePlayer)"/>`,
  styles: [`
    img {
      width: 150px;
      vertical-align: middle;
    }
    .left {
      transform: scaleX(-1);
    }
  `],
})
export class SwipeComponent {
  @Input() direction: string;
  @Output() onClick = new EventEmitter();

  private likePlayer: boolean;

  constructor() {}

  ngOnInit() {
    this.likePlayer = this.direction === 'right';
  }
}

