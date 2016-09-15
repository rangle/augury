import {Component} from '@angular/core';

@Component({
  selector: 'angular-directives',
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
