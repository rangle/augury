import {Component, EventEmitter, OnChanges, Input, Output} from '@angular/core';

@Component({
  selector: 'bt-tab-menu',
  templateUrl: '/src/frontend/components/tab-menu/tab-menu.html'
})
export default class TabMenu {
  @Input() tabs: any;
  @Input() selectedTabIndex: number = 0;
  @Output() tabChange: EventEmitter<number> = new EventEmitter<number>();

  ngOnChanges(changes): void {
    this.tabClick(this.selectedTabIndex);
  }

  tabClick(index: number) {
    this.tabs.forEach((t) => {
      t.selected = false;
    });

    this.tabs[index].selected = true;

    const selected = this.tabs.filter((t) => t.selected);
    this.tabChange.emit(index);
  }

}
