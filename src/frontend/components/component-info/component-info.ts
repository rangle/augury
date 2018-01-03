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

import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-component-info',
  template: require('./component-info.html'),
  styles: [require('to-string!./component-info.css')],
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
  @Output() private emitValue = new EventEmitter<{path: Path, data: any}>();
  @Output() private updateProperty = new EventEmitter<{path: Path, newValue: any}>();

  private changeDetectionStrategies = ChangeDetectionStrategy;
  private ComponentLoadState = ComponentLoadState;
  private path: Path;

  constructor(private actions: UserActions) {}

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

  private onTriggerTemplateEvent(listener) {
    this.actions.triggerEvent(this.node, listener);
  }

  private get hasDirectives() {
    return this.node &&
      this.node.directives &&
      this.node.directives.length > 0;
  }

  private get hasTemplateEventListeners() {
    return this.node &&
      this.node.listeners &&
      this.node.listeners.length;
  }

  private get hasDependencies() {
    return this.node &&
      this.node.dependencies &&
      this.node.dependencies.length > 0;
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

  private onViewComponentSource() {
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

  private onUpdateProperty(event: {path: Path, propertyKey: Path, newValue}) {
    this.actions.updateProperty(event.path.concat(event.propertyKey), event.newValue);
    this.updateProperty.emit({ path: event.path.concat(event.propertyKey), newValue: event.newValue });
    if (this.node) {
      this.selectNode.emit(this.node);
    }
  }

  private onUpdateProvider(event: {path: Path, propertyKey: Path, newValue}) {
    this.actions.updateProvider(event.path, event.propertyKey, event.newValue);

    if (this.node) {
      this.selectNode.emit(this.node);
    }
  }
}
