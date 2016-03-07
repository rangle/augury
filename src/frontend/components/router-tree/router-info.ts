import {Component, Input} from 'angular2/core';

@Component({
  selector: 'bt-router-info',
  inputs: ['selectedNode'],
  template: `
  <div *ngIf="selectedNode">
    name: {{selectedNode.name}}
    path: {{selectedNode.name}}
    specificity: {{selectedNode.specificity}}
    handler: {{selectedNode.handler}}
    data: {{selectedNode.data}}
  </div>
  `,
  directives: [RouterInfo]
})

export default class RouterInfo {
  // @Input() selectedNode: RouteNode;

}