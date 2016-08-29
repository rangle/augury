import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
} from '@angular/core';

import {Highlightable} from '../highlightable';

@Component({
  selector: 'bt-property-value',
  template: require('./property-value.html'),
})
export default class PropertyValue extends Highlightable {
  @Input() private key: string;
  @Input() private value: string;

  constructor(@Inject(ChangeDetectorRef) changeDetectorRef: ChangeDetectorRef) {
    const valueChanged = changes => changes != null
      && changes.hasOwnProperty('value')
      && changes.value.currentValue !== changes.value.previousValue;

    super(changeDetectorRef, changes => valueChanged(changes));
  }
}
