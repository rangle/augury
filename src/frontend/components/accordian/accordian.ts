import {Component} from 'angular2/core';
import {NgClass} from 'angular2/common';

@Component({
  selector: 'accordian',
  templateUrl: '/src/frontend/components/accordian/accordian.html',
  inputs: ['sectionTitle']
})
export default class Accordian {
  expanded = false;
}
