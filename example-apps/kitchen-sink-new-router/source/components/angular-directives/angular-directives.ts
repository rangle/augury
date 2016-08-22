import {Component} from '@angular/core';

import NgIfDirective from './ngif-directive';
import NgForDirective from './ngfor-directive';
import NgSwitchDirective from './ngswitch-directive';
import NgClassDirective from './ngclass-directive';
import NgStyleDirective from './ngstyle-directive';
import NgLocalizationDirective from './nglocalization-directive';

@Component({
  selector: 'angular-directives',
  directives: [
    NgIfDirective,
    NgForDirective,
    NgSwitchDirective,
    NgClassDirective,
    NgStyleDirective,
    NgLocalizationDirective
  ],
  template: `
  <div>
    <ngif-directive></ngif-directive>
    <hr/>
    <ngfor-directive></ngfor-directive>
    <hr/>
    <ngswitch-directive></ngswitch-directive>
    <hr/>
    <ngclass-directive></ngclass-directive>
    <hr/>
    <ngstyle-directive></ngstyle-directive>
    <hr/>
    <nglocalization-directive></nglocalization-directive>
  </div>
  `
})
export default class AngularDirectives {}
