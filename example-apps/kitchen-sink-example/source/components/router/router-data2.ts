import {Component} from 'angular2/core';
import {RouteParams, RouteData} from 'angular2/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h4>Hello There!!</h4>
    <p>Message: {{message}}</p>
    <p>Name: {{name}}</p>
  </div>
  `
})
export default class RouterData2 {
  public message: string;
  public name: string;

  constructor(private routeParams: RouteParams) {
    this.message = this.routeParams.get('message');
    this.name = this.routeParams.get('name');
  }
}
