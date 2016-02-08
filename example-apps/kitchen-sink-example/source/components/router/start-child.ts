import {Component, View} from 'angular2/core';

@Component({
  selector: 'start-child'
})
@View({
  template: `
  <div>
    <h4>
      <span class="label label-warning">Router Start child component</span>
    </h4>
  </div>
  `
})
export default class StartChild { }
