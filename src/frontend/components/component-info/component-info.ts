declare var JSONFormatter: any;

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

  private ngOnChanges(changes: SimpleChanges) {
    this.displayTree();
  }

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

  private get hasChildren() {
    return this.node &&
           this.node.children &&
           this.node.children.length > 0;
  }

  private get hasProperties() {
    return this.node &&
           this.node.description &&
           this.node.description.length > 0;
  }

  private viewComponentSource() {
    chrome.devtools.inspectedWindow.eval(`
      var root = ng.probe(window.pathLookupNode('${this.node.id}'));
      if (root) {
        inspect(root.componentInstance.constructor);
      }`);
  }

  private isJson(data: string): boolean {
    try {
      JSON.parse(data);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  private emitValue(outputProperty: string, data) {
    if (this.isJson(data)) {
      data = JSON.parse(data);
    }

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

  private displayTree() {
    if (this.node == null) {
      return;
    }

    const childrenContainer = this
      .elementRef.nativeElement
      .querySelector('#tree-children');

    if (childrenContainer && this.node.children) {
      while (childrenContainer.firstChild) {
        childrenContainer.removeChild(childrenContainer.firstChild);
      }
      const formatter2 = new JSONFormatter(this.node.children);
      childrenContainer.appendChild(formatter2.render());
    }
  }
}
