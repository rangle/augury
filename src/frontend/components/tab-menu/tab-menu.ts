import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface TabDescription {
  title: string;
  selected: boolean;
  tab;
}

@Component({
  selector: 'bt-tab-menu',
  template: require('./tab-menu.html'),
})
export class TabMenu {
  @Input() tabs: Array<TabDescription>;
  @Input() selectedTab;
  @Input() showLogo: boolean = false;

  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();

  private ngOnInit() {
    const t = this.tabs.filter(tab => tab.tab === this.selectedTab);
    if (t.length > 0) {
      this.onSelect(t[0]);
    }
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
