import {Component, Input} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';

@Component({
  selector: 'bt-router-info',
  templateUrl: '/src/frontend/components/router-tree/router-info.html',
  styles: [`
    ul.route-info {
      list-style: none;
      padding: 0;
    }
    ul.route-info ul {
      padding-left: 15px;
      list-style: none;
    }
  `],
  directives: [RouterInfo, NgFor, NgIf]
})

export default class RouterInfo {
  @Input() selectedNode: any;
  ngOnChanges() {
    if (!this.selectedNode || !this.selectedNode.data) {
      return;
    }
    this.selectedNode._data = [];
    for (let key in this.selectedNode.data.data) {
      if (this.selectedNode.data.data.hasOwnProperty(key)) {
        this.selectedNode._data.push({
          key: key,
          value: this.selectedNode.data.data[key]
        });
      }
    }
  }
}
