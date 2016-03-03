import {Component, View} from 'angular2/core';

@Component({
  selector: 'inner-child-main'
})
@View({
  template: `
  <div>
    <h4>
      <span class="label label-default">Inner Child Main</span>
    </h4>
  </div>
  `
})
export default class InnerChildMain { }
