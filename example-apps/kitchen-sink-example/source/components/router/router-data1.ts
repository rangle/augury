import {Component} from '@angular/core';
import {RouteParams, RouteData} from '@angular/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Data: {{data}}</h4>
  </div>
  `
})
export default class RouterData1 {
  public message: string;
  public data: string;

  constructor (private routeParams: RouteParams, private routeData: RouteData) {
    this.message = this.routeParams.get('message');
    this.data = this.routeData.get('passedData');
  }
}
