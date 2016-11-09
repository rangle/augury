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
  selected: boolean;
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
  @Input() tree;
  @Input() showMainItems: boolean = false;
  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();

  private isSelectElementActive: boolean = false;

  constructor(private userActions: UserActions) {}

  private ngOnInit() {
    const t = this.tabs.filter(tab => tab.tab === this.selectedTab);
    if (t.length > 0) {
      this.onSelect(t[0]);
    }
  }

  private selectElement(event) {
    if (this.isSelectElementActive) {
      this.isSelectElementActive = false;
      return this.userActions.clearSelectElement();
    }
    this.isSelectElementActive = true;
    this.userActions.selectElement();
  }

  private onSelect(tab: TabDescription) {
    this.tabs.forEach((t) => {
      t.selected = false;
    });

    tab.selected = true;

    const selected = this.tabs.filter((t) => t.selected);

    this.tabChange.emit(tab.tab);
  }
}
