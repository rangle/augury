import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
} from '@angular/core';

import {Highlightable} from '../../utils/highlightable';

@Component({
  selector: 'bt-property-value',
  template: require('./property-value.html'),
})
export class PropertyValue extends Highlightable {
  @Input() private key: string;
  @Input() private value: string;

  constructor(@Inject(ChangeDetectorRef) changeDetectorRef: ChangeDetectorRef) {
    super(changeDetectorRef, changes => changes && changes.hasOwnProperty('value'));
  }
}
