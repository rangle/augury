import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="flex items-center">
      <img *ngIf="state" src="../../assets/lights-on.png" class="self-center p1">
      <img *ngIf="!state" src="../../assets/lights-off.png" class="self-center p1">
      <button (click)="onToggleState()" class="btn btn-primary caps">{{label}}</button>
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
