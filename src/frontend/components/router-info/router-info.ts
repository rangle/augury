import {Component, Input} from '@angular/core';

import {Route} from '../../../backend/utils';

@Component({
  selector: 'bt-router-info',
  templateUrl: './router-info.html',
})
export class RouterInfo {
  @Input() selectedRoute: Route | any;

  private hasSelection() {
    return this.selectedRoute.data &&
           this.selectedRoute.data.length > 0;
  }

  private ngOnChanges() {
    if (!this.selectedRoute || !this.selectedRoute.data) {
      return;
    }

    this.selectedRoute._data = [];

    for (let key in this.selectedRoute.data.data) {
      if (this.selectedRoute.data.data.hasOwnProperty(key)) {
        this.selectedRoute._data.push({
          key: key,
          value: this.selectedRoute.data.data[key]
        });
      }
    }
  }
}
