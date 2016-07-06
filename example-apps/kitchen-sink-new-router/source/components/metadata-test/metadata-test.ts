import {Component, Input, Output} from '@angular/core';

@Component({
    selector: "attr-from-array",
    inputs: ["attrIn"],
    outputs: ["attrOut"],
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromArray {
}

@Component({
    selector: "attr-from-decorator",
    template: `<p>{{attrIn}}</p>`
})
export class MetadataFromDecorator {
    @Input() attrIn: any;
    @Output() attrOut: any;
}
@Component({
  selector: 'metadata-test',
  directives: [MetadataFromArray, MetadataFromDecorator],
  template: `
    <attr-from-array attrIn="Data from the array."></attr-from-array>
    <attr-from-decorator attrIn="Data from the decorator."></attr-from-decorator>
  `
})
export default class MetadataTest {
}

