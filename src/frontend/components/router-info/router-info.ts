import {Component, Input} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'bt-router-info',
  templateUrl: '/src/frontend/components/router-info/router-info.html',
  directives: [NgFor, NgIf]
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
