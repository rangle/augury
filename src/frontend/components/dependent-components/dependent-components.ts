import {Component, EventEmitter} from 'angular2/core';

@Component({
  selector: 'bt-dependent-components',
  templateUrl:
    '/src/frontend/components/dependent-components/dependent-components.html',
  inputs: ['dependency', 'components'],
  outputs: ['selectDependency', 'selectNode']
})
export default class DependentComponents {
  private components: any;
  private dependency: string;
  private selectDependency: EventEmitter<string> = new EventEmitter<string>();
  private selectNode: EventEmitter<any> = new EventEmitter<any>();

  findDependencies(dependency: string): void {
    this.selectDependency.emit(dependency);
  }

  selectComponent(component: any): void {
    this.selectNode.emit(component);
  }
}
