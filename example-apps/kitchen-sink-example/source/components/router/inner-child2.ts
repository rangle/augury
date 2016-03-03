import {Component, View} from 'angular2/core';

@Component({
  selector: 'inner-child2'
})
@View({
  template: `
  <div>
    <h4>
      <span class="label label-default">Inner Child 2</span>
    </h4>
  </div>
  `
})
export default class InnerChild2 { }
