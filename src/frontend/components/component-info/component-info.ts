declare var JSONFormatter: any;
import {Component, ElementRef, Inject, OnChanges, EventEmitter}
  from 'angular2/core';

@Component({
  selector: 'bt-component-info',
  templateUrl: '/src/frontend/components/component-info/component-info.html',
  inputs: ['node'],
  outputs: ['selectDependency']
})
export default class ComponentInfo {
  private node: any;
  private selectDependency: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  ngOnChanges(changes): void {
    if (this.node) {
      this.displayTree();
    }
  }

  findDependencies(dependency: string) : void {
    this.selectDependency.emit(dependency);
  }

  displayTree(): void {
    const stateContainer = this
      .elementRef.nativeElement
      .querySelector('#tree-state');

    const childrenContainer = this
      .elementRef.nativeElement
      .querySelector('#tree-children');

      while (stateContainer.firstChild) {
        stateContainer.removeChild(stateContainer.firstChild);
      }
      const formatter = new JSONFormatter(this.node.state);
      stateContainer.appendChild(formatter.render());

      while (childrenContainer.firstChild) {
        childrenContainer.removeChild(childrenContainer.firstChild);
      }

      if (this.node.children) {
        const formatter2 = new JSONFormatter(this.node.children);
        childrenContainer.appendChild(formatter2.render());
      }
  }

  formatInput(input: any): string {
    let [key, value] = input.split(':');
    let str = value ?
      `<p class="node-item-property">${key}:</p>
        <p class="node-item-value"> ${value}</p>` :
      `<p class="node-item-property">${key}</p>`;
    return str;
  }

}
