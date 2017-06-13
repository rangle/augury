import {
  Component,
  Input,
} from '@angular/core';

import {NodeAttributes} from './node-attributes';

@Component({
  selector: 'node-open-tag',
  template: require('./node-open-tag.html'),
  styles: [require('./node-open-tag.css')],
})
export class NodeOpenTag {
  @Input() private node;
  @Input() private hasChildren: boolean;
}
