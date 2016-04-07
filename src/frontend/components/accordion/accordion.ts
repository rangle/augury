import {Component} from 'angular2/core';
import {NgClass} from 'angular2/common';

@Component({
  selector: 'accordion',
  templateUrl: '/src/frontend/components/accordion/accordion.html',
  inputs: ['sectionTitle']
})
export default class Accordion {
  expanded = false;
}
