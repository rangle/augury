import {Component, Input} from '@angular/core';

import {Route} from '../../../backend/utils/parse-router';

@Component({
  selector: 'bt-router-info',
  template: require('./router-info.html'),
})

export class RouterInfo {
  @Input() private selectedRoute: Route | any;

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
