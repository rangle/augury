import {
  Component,
  Input,
} from '@angular/core';

import {NodeAttributes} from './node-attributes';

@Component({
  selector: 'node-open-tag',
  templateUrl: './node-open-tag.html',
  styleUrls: ['./node-open-tag.css'],
})
export class NodeOpenTag {
  @Input() node;
  @Input() private hasChildren: boolean;
}
