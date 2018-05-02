import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';

import {
  MutableTree,
  Node,
} from '../../../tree';

import {Dependency} from '../../../backend/utils/description';

import {Stack} from '../../../structures';

@Component({
  selector: 'bt-dependency-info',
  templateUrl: './dependency-info.html',
})
export class DependencyInfo {
  @Input() selectedNode: Node;
  @Input() tree: MutableTree;

  @Output() private selectNode = new EventEmitter<Node>();

  selectedDependency: Dependency;

  private dependentComponents: Array<any> = [];

  private navigationStack = new Stack<Dependency>();

  constructor(private userActions: UserActions) {}

  private get dependencies(): Array<{[key: string]: any}> {
    if (this.selectedNode == null) {
      return [];
    }
    return this.selectedNode.dependencies;
  }

  get hasDependencies() {
    return this.dependentComponents &&
           this.dependentComponents.length > 0;
  }

  private select(dependency: Dependency) {
    this.selectedDependency = dependency;

    this.dependentComponents = this.getDependencies(dependency);
  }

  private onDependencySelected(dependency: Dependency) {
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

  private reset() {
    this.navigationStack.clear();

    this.selectedDependency = null;

    this.dependentComponents = [];
  }

  private getDependencies(dependency: Dependency): Array<Node> {
    if (this.tree == null) {
      return [];
    }

    const dependents = new Array<Node>();

    this.tree.recurseAll(node => {
      this.dependencies.map((dep: any) => {
        if (dep && dependency && dep.id === dependency.id) {
          dependents.push(node);
        }
      });
    });

    return dependents;
  }
}
