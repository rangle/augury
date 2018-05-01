import {Component, Input} from '@angular/core';

import {Property} from '../../../backend/utils';

@Component({
  selector: 'node-attributes',
  templateUrl: './node-attributes.html',
  styleUrls: ['./node-attributes.css'],
})
export class NodeAttributes {
  @Input() attributes: Array<Property>;
}
