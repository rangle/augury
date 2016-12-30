import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

import {ComponentLoadState} from '../../state';

import {
  ComponentMetadata,
  Metadata,
  MutableTree,
  Node,
  Path,
  deserializePath,
} from '../../../tree';

import {functionName} from '../../../utils';

@Component({
  selector: 'bt-component-info',
  template: require('./component-info.html'),
})
export class ComponentInfo {
  @Input() private node: Node;
  @Input() private tree: MutableTree;
  @Input() private state;
  @Input() private providers: Array<any>;
  @Input() private metadata: Metadata;
  @Input() private componentMetadata: ComponentMetadata;
  @Input() private loadingState: ComponentLoadState;

  @Output() private selectNode = new EventEmitter<Node>();

  private changeDetectionStrategies = ChangeDetectionStrategy;

  private ComponentLoadState = ComponentLoadState;

  private path: Path;

  ngOnChanges() {
    if (this.node) {
      this.path = deserializePath(this.node.id);
    }
  }

  private get hasState() {
    if (this.node == null || this.state == null) {
      return false;
    }

    return Object.keys(this.state).length > 0;
  }

  private get hasDirectives() {
    return this.node &&
      this.node.directives &&
      this.node.directives.length > 0;
  }

  private get hasDependencies() {
    return this.node &&
      this.node.dependencies &&
      this.node.dependencies.length > 0;
  }

  private get hasProperties() {
    return this.node &&
      this.node.description &&
      this.node.description.length > 0;
  }

  private get hasInstanceProviders() {
    return this.providers && this.providers.length > 0;
  }

  private get instanceProvidersObject() {
    if (this.hasInstanceProviders === false) {
      return {};
    }
    return this.providers.reduce((p, c) => Object.assign(p, {[c[0]]: c[1]}), {});
  }

  private providerPath = (nodePath: Path, propertyKey: string): Path => {
    const providerIndex = this.providers.findIndex(ip => ip[0] === propertyKey);

    return [...nodePath, 'providers', providerIndex];
  };

  private viewComponentSource() {
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
}
