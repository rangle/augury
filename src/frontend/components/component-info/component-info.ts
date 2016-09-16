import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {ComponentLoadState} from '../../state';
import {InputOutput} from '../../../frontend/utils';
import {UserActions} from '../../actions/user-actions/user-actions';

import {
  Metadata,
  MutableTree,
  Node,
  Path,
  deserializePath,
} from '../../../tree';

@Component({
  selector: 'bt-component-info',
  template: require('./component-info.html'),
})
export class ComponentInfo {
  @Input() node: Node;
  @Input() tree: MutableTree;
  @Input() state;
  @Input() metadata: Metadata;
  @Input() loadingState: ComponentLoadState;

  @Output() private selectNode = new EventEmitter<Node>();

  private ComponentLoadState = ComponentLoadState;

  path: Path;

  inputs: InputOutput;
  outputs: InputOutput;

  ngOnInit() {
    this.ngOnChanges();
  }

  ngOnChanges() {
    if (this.node) {
      this.path = deserializePath(this.node.id);

      const listenerNames = {};
      for (const listener of this.node.listeners) {
        listenerNames[listener.name] = 1;
      }

      this.inputs = {};
      this.outputs = {};
      for (const input of this.node.input) {
        const [name, alias] = input.split(/:/);
        if (listenerNames[name]) {
          this.outputs[name] = {alias};
        } else {
          this.inputs[name] = {alias};
        }
      }
    }
  }

  private get hasState() {
    if (this.node == null || this.state == null) {
      return false;
    }

    return Object.keys(this.state).length > 0;
  }

  private get hasProviders() {
    return this.node &&
      this.node.providers &&
      this.node.providers.length > 0;
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
