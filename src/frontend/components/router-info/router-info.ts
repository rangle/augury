import {Component, Input} from '@angular/core';

import {Route} from '../../../backend/utils';

@Component({
  selector: 'bt-router-info',
  template: require('./router-info.html'),
})

export class RouterInfo {
  @Input() private selectedNode: Route | any;

  private hasSelection() {
    return this.selectedNode.data &&
           this.selectedNode.data.length > 0;
  }

  private ngOnChanges() {
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
