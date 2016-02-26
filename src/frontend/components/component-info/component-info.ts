declare var JSONFormatter: any;
import {Component, ElementRef, Inject, OnChanges, EventEmitter, NgZone}
  from 'angular2/core';

import ParseData from '../../utils/parse-data';

const NATIVE_COMPONENTS = [
  'NgClass',
  'NgIf',
  'RouterLink',
  'RouterOutlet'
];

@Component({
  selector: 'bt-component-info',
  templateUrl: '/src/frontend/components/component-info/component-info.html',
  inputs: ['node'],
  outputs: ['selectDependency', 'updateProperty']
})
export default class ComponentInfo {
  private node: any;
  private selectDependency: EventEmitter<string> = new EventEmitter<string>();
  private updateProperty: EventEmitter<any> = new EventEmitter<any>();
  private stateValues = [];

  constructor(
    private _ngZone: NgZone,
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  onDblClick($event, state) {
    state.editable = true;
    $event.preventDefault();
    $event.stopPropagation();
    this._ngZone.run(() => undefined);
  }

  propertyChange($event, state, value) {
    if ($event.keyCode === 13) {
      state.editable = false;

      const type: string = ParseData.getType(this.node.state, state.key);

      let newValue: any;
      if (type === 'number') {
        newValue = ParseData.convertToNumber(value,
          this.node.state[state.key]);
      } else if (type === 'boolean') {
        newValue = ParseData.convertToBoolean(value,
          this.node.state[state.key]);
      } else {
        newValue = value;
      }

      if (newValue !== this.node.state[state.key]) {
        this.updateProperty.emit({
          'key': state.key,
          'value': value,
          'id': this.node.id,
          'type': type
        });
      }

    }
    this._ngZone.run(() => undefined);
  }

  isAngular2Component(node: any): boolean {
    return node && NATIVE_COMPONENTS.indexOf(node.name) > -1;
  }

  populateStateValues(node: any): void {
    this.stateValues = [];
    for (const key in node.state) {
      this.stateValues.push({
        'key': key,
        'value': node.state[key],
        'editable': false
      });
    }
  }

  ngOnChanges(changes): void {
    if (this.node) {
      this.displayTree();
      if (!this.isAngular2Component(this.node)) {
        this.populateStateValues(this.node);
      }
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
