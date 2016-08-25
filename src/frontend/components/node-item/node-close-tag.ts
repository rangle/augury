import {Component, Input} from '@angular/core';

@Component({
  selector: 'node-close-tag',
  template: require('./node-close-tag.html'),
  styles: [require('to-string!./node-close-tag.css')]
})
export class NodeCloseTag {
  @Input() private node;
}
