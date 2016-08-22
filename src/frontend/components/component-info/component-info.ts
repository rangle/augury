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
import {Node} from '../../../tree';
import {ComponentLoadState} from '../../state';
import {Spinner} from '../spinner/spinner';
import Accordion from '../accordion/accordion';
import ParseData from '../../utils/parse-data';
import RenderState from '../render-state/render-state';
import Dependency from '../dependency/dependency';
import PropertyValue from '../property-value/property-value';

@Component({
  selector: 'bt-component-info',
  template: require('./component-info.html'),
  directives: [
    RenderState,
    Accordion,
    Dependency,
    PropertyValue,
    Spinner,
  ]
})
export class ComponentInfo {
  @Input() node;
  @Input() state;
  @Input() loadingState: ComponentLoadState;

  @Output() private selectionChange = new EventEmitter<Node>();

  private path = new Array<string>();

  private input: Array<any>;

  private ComponentLoadState = ComponentLoadState;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    private userActions: UserActions
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.node) {
      this.normalizeInput();
      this.displayTree();
    }
  }

  viewComponentSource($event) {
    // FIXME(cbond): This will no longer work, augury-id is gone, use node path
    const highlightStr = '[augury-id=\"' + this.node.id + '\"]';

    let evalStr = `inspect(
      ng.probe(document.querySelector('${highlightStr}'))
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
    this.input = [];

    if (this.node.input) {
      this.node.input.forEach(elem => {
        let [key, value] = elem.split(':');
        this.input.push({
          key: key,
          value: (value ? value.trim() : '')
        });
      });
    }
  }

  isJson(data: string): boolean {
    return /^([\s\[\{]*(?:"(?:\\.|[^"])*"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/
      .test(data);
  }

  fireEvent(output: string, param: any) {
    if (this.isJson(param)) {
      param = JSON.parse(param);
    }

    this.userActions.fireEvent({
      'output': output,
      'data': param,
      'id': this.node.id
    });
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
