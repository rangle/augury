import {Component, Input} from '@angular/core';

@Component({
  selector: 'accordion',
  templateUrl: './accordion.html',
})
export class Accordion {
  @Input() sectionTitle: string;
  @Input() private defaultExpanded: boolean;

  expansionState: boolean = null;

  get expanded(): boolean {
    if (this.expansionState == null) {
      return this.defaultExpanded;
    }
    return this.expansionState;
  }

  set expanded(v: boolean) {
    this.expansionState = v;
  }
}
