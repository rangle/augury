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
  templateUrl: './tab-menu.html',
})
export class TabMenu {

  public domSelectionActive;
  @Input() tabs: Array<TabDescription>;
  @Input() selectedTab;
  @Input('domSelectionActive') set _domSelectionActive(e) {
    // TODO: this is for debug, clean up
    console.log(e);
    this.domSelectionActive = e;
  }

  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() domSelectionActiveChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private userActions: UserActions) {}

  selectElement() {
    console.log("first reaction");
    if (this.domSelectionActive) {
      this.userActions.cancelFindElement();
      this.domSelectionActiveChange.emit(false);
    } else {
      this.userActions.findElement();
      this.domSelectionActiveChange.emit(true);
    }
  }

  private onSelect(tab: TabDescription) {
    this.tabChange.emit(tab.tab);
  }
}
