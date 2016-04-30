import {Component} from '@angular/core';
import {RouteParams, RouteData} from '@angular/router';

@Component({
  selector: 'aux-comp',
  template: `
  <div>
    <h3>Hello There!!</h3>
    <h4>Message: {{message}}</h4>
    <h4>Name: {{name}}</h4>
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
