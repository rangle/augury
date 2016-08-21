import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';
import {Node} from '../../../tree';

@Component({
  selector: 'bt-dependency',
  template: require('./dependency.html'),
})
export default class Dependency {
  @Input() dependencies;

  @Output() private selectionChange = new EventEmitter<Node>();

  private currDep: string = '';
  private prevDep: Array<string> = [];
  private depComps: Array<any> = [];
  private isNavBack: boolean = false;

  constructor(private userActions: UserActions) {
    // this.componentDataStore.dataStream
    //   .filter((data: any) => data.action &&
    //     data.action === UserActionType.GET_DEPENDENCIES)
    //   .subscribe(({ selectedDependency, dependentComponents }) => {
    //     if (this.currDep !== '' && !this.isNavBack) {
    //       this.prevDep.push(this.currDep);
    //     }
    //     this.isNavBack = false;
    //     this.currDep = selectedDependency;
    //     this.depComps = dependentComponents;
    //   });

    // this.componentDataStore.dataStream
    //   .filter((data: any) => data.action &&
    //     data.action === UserActionType.SELECT_NODE)
    //   .subscribe(() => {
    //     this.reset();
    //   });
  }

  findDependency(dep: string) {
    this.userActions.getDependencies(dep);
  }

  navBack() {
    if (this.prevDep.length === 0) {
      this.reset();
    } else {
      this.isNavBack = true;
      this.findDependency(this.prevDep.pop());
    }
  }

  selectComponent(node: Node) {
    this.selectionChange.emit(node);
  }

  reset() {
    this.isNavBack = false;
    this.prevDep = [];
    this.currDep = '';
    this.depComps = [];
  }
}
