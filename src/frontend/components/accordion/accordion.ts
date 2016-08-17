import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'accordion',
  template: require('./accordion.html'),
})
export default class Accordion {
  @Input() sectionTitle: string;
  expanded = false;
}
