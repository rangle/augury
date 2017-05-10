import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserActions } from '../../actions/user-actions/user-actions';

@Component({
  selector: 'select-component-button',
  template: `
    <img src="../images/augury-logo.svg" class="logo">
    <div (click)="selectElement().emit(DOMSelectionActive)" class="select-element"
         [ngClass]="{'select-element-active': DOMSelectionActive}">
      <img src="../images/search-icon.svg">
    </div>
  `
})
export class SelectComponentButton {
  @Input() DOMSelectionActive: boolean = false;
  @Output() DOMSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private userActions: UserActions) {}

  private selectElement() {
    if (this.DOMSelectionActive) {
      this.userActions.cancelFindElement();
      this.DOMSelectionActive = false;
    } else {
      this.userActions.findElement();
      this.DOMSelectionActive = true;
    }
    return this.DOMSelectionChange;
  }

}
