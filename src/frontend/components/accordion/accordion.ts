import {Component} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'accordion',
  templateUrl: '/src/frontend/components/accordion/accordion.html',
  inputs: ['sectionTitle']
})
export default class Accordion {
  expanded = false;
}
