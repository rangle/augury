import {Component, Input, ViewEncapsulation} from 'angular2/core';

@Component({
  selector: 'bt-router-info',
  inputs: ['selectedNode'],
  template: `
  <div *ngIf="selectedNode">
    <p>name: {{selectedNode.name}}</p>
    <p>path: {{selectedNode.name}}</p>
    <p>specificity: {{selectedNode.specificity}}</p>
    <p>handler: {{selectedNode.handler}}</p>
    <p>isAuxiliary: {{selectedNode.isAux ? 'true' : 'false'}}</p>
  </div>
  `,
  directives: [RouterInfo]
})

export default class RouterInfo {
  // @Input() selectedNode: RouteNode;

}
