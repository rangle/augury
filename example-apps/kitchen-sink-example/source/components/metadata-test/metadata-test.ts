import {Component, Input, Output} from '@angular/core';

@Component({
    selector: 'attr-from-array',
    inputs: ['attrIn'],
    outputs: ['attrOut'],
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromArray {
}

@Component({
    selector: 'attr-from-decorator',
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromDecorator {
    @Input() attrIn: any;
    @Output() attrOut: any;
}


@Component({
    selector: 'attr-from-array-custom',
    inputs: ['attrIn:attrCustomIn'],
    outputs: ['attrOut'],
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromArrayWithCustomName {
}

@Component({
    selector: 'attr-from-decorator-custom',
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromDecoratorWithCustomName {
    @Input('attrCustomIn') attrIn: any;
    @Output() attrOut: any;
}


@Component({
  selector: 'metadata-test',
  template: `
    <attr-from-array attrIn='Data from the array.'>
    </attr-from-array>

    <attr-from-decorator attrIn='Data from the decorator.'>
    </attr-from-decorator>

    <attr-from-array-custom attrCustomIn='Data from array using a custom name.'>
    </attr-from-array-custom>

    <attr-from-decorator-custom
      attrCustomIn='Data from decorator using a custom name.'>
    </attr-from-decorator-custom>
  `
})
export class MetadataTest {}
