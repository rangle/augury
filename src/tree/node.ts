import {Property} from '../backend/utils/description';

export interface EventListener {
  name: string;
  callback: Function;
}

export interface DecoratorDisplay {
  name: string;
  arg?: any;
}

export interface DecoratorDisplayMap {
  [key: string]: Array<DecoratorDisplay>;
}

export interface Node {
  changeDetection: string;
  children: Array<Node>;
  decorators: DecoratorDisplayMap;
  dependencies: Array<string>;
  description: Array<Property>;
  directives: Array<string>;
  id: string;
  injectors: Array<string>;
  isComponent: boolean;
  listeners: Array<EventListener>;
  name: string;
  nativeElement: () => HTMLElement; // null on frontend
  providers: Array<Property>;
}
