declare var JSONFormatter: any;
import {Component, ElementRef, Inject, EventEmitter,
  OnChanges}
  from 'angular2/core';

import ParseData from '../../utils/parse-data';
import RenderState from '../render-state/render-state';

@Component({
  selector: 'bt-component-info',
  templateUrl: '/src/frontend/components/component-info/component-info.html',
  inputs: ['node'],
  outputs: ['selectDependency'],
  directives: [RenderState]
})
export default class ComponentInfo {
  private node: any;
  private selectDependency: EventEmitter<string> = new EventEmitter<string>();
  private propertyTree: string = '';

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  findDependencies(dependency: string) : void {
    this.selectDependency.emit(dependency);
  }

  ngOnChanges(change: any) {
    if (this.node) {
      this.displayTree();
    }
  }

  viewComponentSource($event) {
    const highlightStr = '[batarangle-id=\"' + this.node.id + '\"]';

    let evalStr = `inspect(ng.probe(document.querySelector('${highlightStr}'))
    .componentInstance.constructor)`;

    chrome.devtools.inspectedWindow.eval(
      evalStr,
      function(result, isException) {
        if (isException) {
          console.log(isException);
        }
      }
    );

    $event.preventDefault();
    $event.stopPropagation();
  }

  displayTree(): void {

    const childrenContainer = this
      .elementRef.nativeElement
      .querySelector('#tree-children');

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
