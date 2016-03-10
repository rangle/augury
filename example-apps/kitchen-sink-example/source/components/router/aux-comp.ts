import {Component, View} from 'angular2/core';

@Component({
  selector: 'aux-comp'
})
@View({
  template: `
  <div>
    <h4>Hello There!!</h4>
    <h5>I am AuxComp</h5>
  </div>
  `
})
export default class AuxComp { }
