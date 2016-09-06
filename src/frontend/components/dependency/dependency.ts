import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';

import {
  MutableTree,
  Node,
} from '../../../tree';

import {Stack} from '../../../structures';

@Component({
  selector: 'bt-dependency',
  template: require('./dependency.html'),
})
export class Dependency {
  @Input() selectedNode: Node;
  @Input() tree: MutableTree;

  @Output() private selectionChange = new EventEmitter<Node>();

  private selectedDependency: string;

  private dependentComponents: Array<any> = [];

  private navigationStack = new Stack<string>();

  constructor(private userActions: UserActions) {}

  private get dependencies(): Array<string> {
    if (this.selectedNode == null) {
      return [];
    }
    return this.selectedNode.dependencies;
  }

  private get hasDependencies() {
    return this.dependentComponents &&
           this.dependentComponents.length > 0;
  }

  private select(dependency: string) {
    this.selectedDependency = dependency;

    this.dependentComponents = this.getDependencies(dependency);
  }

  private onDependencySelected(dependency: string) {
    if (this.selectedDependency) {
      this.navigationStack.push(this.selectedDependency);
    }

    this.select(dependency);
  }

  private onBack() {
    if (this.navigationStack.size === 0) {
      this.reset();
    }
    else {
      this.select(this.navigationStack.pop());
    }
  }

  private onSelectComponent(node: Node) {
    this.selectionChange.emit(node);
  }

  private reset() {
    this.navigationStack.clear();

    this.selectedDependency = null;

    this.dependentComponents = [];
  }

  private getDependencies(dependency: string): Array<Node> {
    if (this.tree == null) {
      return [];
    }

    const dependents = new Array<Node>();

    this.tree.recurseAll(node => {
      if (node.dependencies.indexOf(dependency) >= 0) {
        dependents.push(node);
      }
    });

    return dependents;
  }
}
