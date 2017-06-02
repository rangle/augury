import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  InstanceWithMetadata,
  Metadata,
  Node,
  ObjectType,
  Path,
} from '../../../tree';

export interface TabDescription {
  title: string;
  tab;
}

import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-tab-menu',
  template: require('./tab-menu.html'),
})
export class TabMenu {
  @Input() tabs: Array<TabDescription>;
  @Input() selectedTab;
  @Input() DOMSelectionActive;

  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() DOMSelectionActiveChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private userActions: UserActions) {
  }

  private ngOnInit() {
    const t = this.tabs.filter(tab => tab.tab === this.selectedTab);
  }

  private selectElement() {
    if (this.DOMSelectionActive) {
      this.userActions.cancelFindElement();
      this.DOMSelectionActiveChange.emit(false);
    } else {
      this.userActions.findElement();
      this.DOMSelectionActiveChange.emit(true);
    }
  }

  private onSelect(tab: TabDescription) {
    this.tabChange.emit(tab.tab);
  }
}
