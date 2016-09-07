import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';

import {ComponentLoadState} from '../../state';
import {Node} from '../../../tree';
import {StateTab} from '../../state';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-info-panel',
  template: require('./info-panel.html'),
})
export class InfoPanel {
  @Input() tree;
  @Input() node;
  @Input() state;
  @Input() loadingState: ComponentLoadState;

  @Output() private selectionChange = new EventEmitter<Node>();

  private StateTab = StateTab;

  private selectedTab = StateTab.Properties;

  private tabs = [{
      title: 'Properties',
      selected: false,
      tab: StateTab.Properties,
    }, {
      title: 'Injector Graph',
      selected: false,
      tab: StateTab.InjectorGraph,
    }];

  constructor(private userActions: UserActions) {}

  private onSelectedTabChanged(tab: StateTab) {
    this.selectedTab = tab;
  }
}
