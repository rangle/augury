import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'bt-generic-tabs',
  template: require('./generic-tabs.component.html'),
  styles: [
    require('to-string!./generic-tabs.component.css'),
  ],
})
export class GenericTabsComponent {

  @Output('change') change: EventEmitter<string> = new EventEmitter<string>();

  @Input('tabs') tabs: Array<string>;
  @Input('selected') set selected(tab: string) {
    this._selected = tab;
    this.change.emit(tab);
  }

  _selected: string;

  onSelect(tab: string) {
    this.selected = tab;
  }

}
