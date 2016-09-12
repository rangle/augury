import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {ComponentLoadState} from '../../state';
import {Property} from '../../../backend/utils/description';
import {InputOutput} from '../../../frontend/utils';

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

  @Output() private selectionChange = new EventEmitter<Node>();

  private ComponentLoadState = ComponentLoadState;

  constructor(
    private userActions: UserActions
  ) {}

  private get path(): Path {
    return deserializePath(this.node.id);
  }

  private get inputs(): InputOutput {
    if (this.node == null || this.node.input == null) {
      return {};
    }

    return this.node.input.reduce(
      (accum, input) => {
        const [name, alias] = input.split(/:/);
        accum[name] = {alias};
        return accum;
      },
      <InputOutput> {});
  }

  private get outputs(): InputOutput {
    if (this.node == null) {
      return {};
    }

    return this.node.output.reduce(
      (accum, output) => {
        const [name, alias] = output.split(/:/);
        accum[name] = {alias};
        return accum;
      },
      <InputOutput> {});
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
