import {Component, Input} from '@angular/core';

import {Property} from '../../../backend/utils';

@Component({
  selector: 'node-attributes',
  template: require('./node-attributes.html'),
  styles: [require('to-string!./node-attributes.css')],
})
export class NodeAttributes {
  @Input() private attributes: Array<Property>;
}