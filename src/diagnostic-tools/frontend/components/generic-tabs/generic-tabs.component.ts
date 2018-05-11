import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'bt-generic-tabs',
  templateUrl: './generic-tabs.component.html',
  styleUrls: [
    './generic-tabs.component.css',
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
