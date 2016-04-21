import {Component} from 'angular2/core';

import NgIfDirective from './ngif-directive';
import NgForDirective from './ngfor-directive';
import NgSwitchDirective from './ngswitch-directive';
import NgClassDirective from './ngclass-directive';
import NgStyleDirective from './ngstyle-directive';
import NgLocalizationDirective from './nglocalization-directive';
import Demo from './demo';

@Component({
  selector: 'angular-directives',
  directives: [NgIfDirective, NgForDirective,
    NgSwitchDirective, NgClassDirective, NgStyleDirective,
    NgLocalizationDirective, Demo],
  template: `
  <div>
    <demo [msg]='"input data"' (newMsg)='doStuff($event)'></demo>
    <hr/>
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
export default class AngularDirectives {
  doStuff($event) {
    console.log($event);
  }
}
