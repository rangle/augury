import {Component} from 'angular2/core';

@Component({
  selector: 'hello',
  inputs: ['msg'],
  template: `
  <h4>
    Message: {{msg}}
  </h4>
  `
})
export default class Hello { }
