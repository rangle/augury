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
import {MainActions} from '../../actions/main-actions';

@Component({
  selector: 'bt-tab-menu',
  template: require('./tab-menu.html'),
})
export class TabMenu {
  @Input() tabs: Array<TabDescription>;
  @Input() selectedTab;
  @Input() tree;
  @Input() showMainItems: boolean = false;
  @Input() DOMSelectionActive: boolean = false;

  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() DOMSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private userActions: UserActions, private mainActions: MainActions) {
  }

  private ngOnInit() {
    const t = this.tabs.filter(tab => tab.tab === this.selectedTab);
  }

  private selectElement() {
    if (this.DOMSelectionActive) {
      this.userActions.cancelFindElement();
      this.DOMSelectionActive = false;
    } else {
      this.userActions.findElement();
      this.DOMSelectionActive = true;

      if (this.selectedTab !== this.tabs[0].tab) {
        this.onSelect(this.tabs[0]);
      }
    }
    return this.DOMSelectionChange.emit(this.DOMSelectionActive);
  }

  private onSelect(tab: TabDescription) {
    this.mainActions.selectTab(tab.tab);
  }
}
