import {Component, Input} from '@angular/core';

// @todo: define augury datatypes isomorphically. move angular-reader to isomorphic module directory.
//        then get rid of this copypaste of the interface
// import {Property} from '../../../backend/utils';
// @todo: this one is not yet defined in angular-reader. still a copy-paste from description.ts
export interface Property {
  id?: string;
  key: string;
  value;
}


@Component({
  selector: 'node-attributes',
  template: require('./node-attributes.html'),
  styles: [require('to-string!./node-attributes.css')],
})
export class NodeAttributes {
  @Input() private attributes: Array<Property>;
}
