import {Component} from 'angular2/core';

@Component({
  selector: 'hello',
  inputs: ['msg'],
  template: `
  <p>
    Message: {{msg}}
  </p>
  `
})
export default class Hello { }
