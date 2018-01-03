import {Component, Input} from '@angular/core';

@Component({
  selector: 'accordion',
  template: require('./accordion.html'),
})
export class Accordion {
  @Input() private sectionTitle: string;
  @Input() private defaultExpanded: boolean;

  private expansionState: boolean = null;

  private get expanded(): boolean {
    if (this.expansionState == null) {
      return this.defaultExpanded;
    }
    return this.expansionState;
  }

  private set expanded(v: boolean) {
    this.expansionState = v;
  }
}
