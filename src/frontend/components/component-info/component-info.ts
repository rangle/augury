declare var JSONFormatter: any;
import {Component, ElementRef, Inject, EventEmitter,
  OnChanges}
  from 'angular2/core';

import Accordion from '../accordion/accordion';
import ParseData from '../../utils/parse-data';
import RenderState from '../render-state/render-state';
import Dependency from '../dependency/dependency';

@Component({
  selector: 'bt-component-info',
  templateUrl: '/src/frontend/components/component-info/component-info.html',
  inputs: ['node'],
  directives: [RenderState, Accordion, Dependency]
})
export default class ComponentInfo {
  private node: any;
  private propertyTree: string = '';
  private _input: Array<any>;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  ngOnChanges(change: any) {
    if (this.node) {
      this.normalizeInput();
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

  normalizeInput(): void {
    this._input = [];
    if (this.node.input) {
      this.node.input.forEach(elem => {
        let [key, value] = elem.split(':');
        this._input.push({
          key: key,
          value: (value ? value.trim() : '')
        });
      });
    }
  }

  displayTree(): void {
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
