import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="flex items-center">
      <img [hidden]="state" src="../../assets/lights-on.png" class="self-center p1">
      <img [hidden]="!state" src="../../assets/lights-off.png" class="self-center p1">
      <button (click)="onToggleState()" class="f6 link dim br3 ph3 pv2 dib white bg-light-purple">{{label}}</button>
    </div>
  `,
  styles: []
})
export class ToggleComponent {
  label = "Off";
  state = false;

  onToggleState() {
    this.state = !this.state;
    this.label = this.state ? "On" : "Off";
  }
}
