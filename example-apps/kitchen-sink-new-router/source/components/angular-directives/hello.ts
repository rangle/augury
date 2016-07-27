import {Component, Input} from '@angular/core';

@Component({
  selector: 'hello',
  template: `
  <h4>
    Message: {{msg}}
  </h4>
  `
})
export default class Hello {
  @Input() msg: string;
}
