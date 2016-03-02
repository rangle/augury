import {Component, EventEmitter, OnChanges} from 'angular2/core';

@Component({
  selector: 'bt-tab-menu',
  templateUrl: '/src/frontend/components/tab-menu/tab-menu.html',
  inputs: ['selectedTabIndex'],
  outputs: ['tabChange']
})
export default class TabMenu {

  private selectedTabIndex: number = 0;
  private tabChange: EventEmitter<number> = new EventEmitter<number>();
  private tabs = [{
    title: 'Properties',
    selected: false
  }, {
      title: 'Dependent Components',
      selected: false
    }];

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
