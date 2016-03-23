import {Component} from 'angular2/core';
import {RouteParams, RouteData} from 'angular2/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h4>Hello There!!</h4>
    <p>Message: {{message}}</p>
    <p>Data: {{data}}</p>
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
