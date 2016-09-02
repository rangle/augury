import {
  Component,
  ElementRef,
  Inject,
  EventEmitter,
  OnChanges,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {ComponentLoadState} from '../../state';
import {Spinner} from '../spinner/spinner';
import {Property} from '../../../backend/utils/description';
import Accordion from '../accordion/accordion';
import ParseData from '../../utils/parse-data';
import RenderState from '../render-state/render-state';
import Dependency from '../dependency/dependency';
import PropertyValue from '../property-value/property-value';
import {
  Node,
  Path,
  MutableTree,
  deserializePath,
} from '../../../tree';

export enum EmitState {
  None,
  Emitted,
  Failed,
}

@Component({
  selector: 'bt-component-info',
  template: require('./component-info.html'),
  styles: [require('to-string!./component-info.css')],
  directives: [
    RenderState,
    Accordion,
    Dependency,
    PropertyValue,
    Spinner,
  ]
})
export class ComponentInfo {
  @Input() node: Node;
  @Input() tree: MutableTree;
  @Input() state;
  @Input() loadingState: ComponentLoadState;

  @Output() private selectionChange = new EventEmitter<Node>();

  private input: Array<any>;

  private ComponentLoadState = ComponentLoadState;

  private EmitState = EmitState;

  private emitState = new Map<string, EmitState>();

  constructor(
    private elementRef: ElementRef,
    private userActions: UserActions
  ) {}

  private get path(): Path {
    return deserializePath(this.node.id);
  }

  private get inputs(): Array<Property> {
    if (this.node == null || this.node.input == null) {
      return [];
    }

    return this.node.input.map(
      property => {
        let [key, value] = property.split(':');
        return {key, value};
      });
  }

  private get outputs(): Array<string> {
    if (this.node == null) {
      return [];
    }

    return this.node.output;
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

  private evaluate(data: string) {
    try {
      return (new Function(`return ${data}`))();
    }
    catch (e) {
      return data;
    }
  }

  private emitValue(outputProperty: string, data) {
    data = this.evaluate(data);

    const update = (state: EmitState) => this.emitState.set(outputProperty, state);

    const timedReset = () => setTimeout(() => update(EmitState.None), 3000);

    const path = deserializePath(this.node.id).concat([outputProperty]);

    return this.userActions.emitValue(path, data)
      .then(() => {
        update(EmitState.Emitted);
        timedReset();
      })
      .catch(error => {
        update(EmitState.Failed);
        timedReset();
      });
  }
}

