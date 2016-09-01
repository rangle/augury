import {Component, Input} from '@angular/core';

@Component({
  selector: 'hello-directives',
  template: `
  <h4>
    Message: {{msg}}
  </h4>
  `
})
export default class HelloDirectives {
  @Input() msg: string;
}
