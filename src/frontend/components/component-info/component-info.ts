import { Component, EventEmitter, Input, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

import { ComponentLoadState } from '../../state';

import { ComponentMetadata, Metadata, MutableTree, Node, Path, deserializePath } from '../../../tree';

import { functionName } from '../../../utils';

import { UserActions } from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-component-info',
  templateUrl: './component-info.html',
  styleUrls: ['./component-info.css']
})
export class ComponentInfo {
  @Input() node: Node;
  @Input() tree: MutableTree;
  @Input() state;
  @Input() providers: Array<any>;
  @Input() metadata: Metadata;
  @Input() componentMetadata: ComponentMetadata;
  @Input() loadingState: ComponentLoadState;

  @Output() selectNode = new EventEmitter<Node>();
  @Output() emitValue = new EventEmitter<{ path: Path; data: any }>();
  @Output() updateProperty = new EventEmitter<{ path: Path; newValue: any }>();

  changeDetectionStrategies = ChangeDetectionStrategy;

  ComponentLoadState = ComponentLoadState;

  path: Path;

  constructor(private actions: UserActions) {}

  ngOnChanges() {
    if (this.node) {
      this.path = deserializePath(this.node.id);
    }
  }

  get hasState() {
    if (this.node == null || this.state == null) {
      return false;
    }

    return Object.keys(this.state).length > 0;
  }

  get hasDirectives() {
    return this.node && this.node.directives && this.node.directives.length > 0;
  }

  get hasDependencies() {
    return this.node && this.node.dependencies && this.node.dependencies.length > 0;
  }

  get hasInstanceProviders() {
    return this.providers && this.providers.length > 0;
  }

  get instanceProvidersObject() {
    if (this.hasInstanceProviders === false) {
      return {};
    }
    return this.providers.reduce((p, c) => Object.assign(p, { [c[0]]: c[1] }), {});
  }

  onViewComponentSource() {
    chrome.devtools.inspectedWindow.eval(`
      var root = ng.probe(inspectedApplication.nodeFromPath('${this.node.id}'));
      if (root) {
        if (root.componentInstance) {
          inspect(root.componentInstance.constructor);
        }
        else {
          throw new Error('This component has no instance and therefore no constructor');
        }
      }`);
  }

  onUpdateProperty(event: { path: Path; propertyKey: Path; newValue }) {
    this.actions.updateProperty(event.path.concat(event.propertyKey), event.newValue);
  }

  onUpdateProvider(event: { path: Path; propertyKey: Path; newValue }) {
    this.actions.updateProvider(event.path, event.propertyKey, event.newValue);
  }
}
