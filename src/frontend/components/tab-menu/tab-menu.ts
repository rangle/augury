import {
  Component,
  EventEmitter,
  Input, OnInit,
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
export class TabMenu implements OnInit {
  @Input() tabs: Array<TabDescription>;
  @Input() selectedTab;

  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
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

    this.tabChange.emit(tab.tab);
  }
}
