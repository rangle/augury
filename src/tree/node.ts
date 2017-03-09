import {Property, Dependency} from '../backend/utils/description';

export interface EventListener {
  name: string;
  callback: Function;
}

export interface InputProperty {
  propertyKey: string;
  bindingPropertyName?: string;
}

export interface OutputProperty extends InputProperty {} // outputs can be aliased too

export interface Node {
  id: string;
  augury_token_id: string;
  name: string;
  isComponent: boolean;
  changeDetection: number;
  description: Array<Property>;
  nativeElement: () => HTMLElement; // null on frontend
  listeners: Array<EventListener>;
  dependencies: Array<Dependency>;
  directives: Array<string>;
  providers: Array<Property>;
  input: Array<InputProperty>;
  output: Array<OutputProperty>;
  source: string;
  children: Array<Node>;
  properties: {
      [key: string]: any;
  };
  attributes: {
      [key: string]: string;
  };
  classes: {
      [key: string]: boolean;
  };
  styles: {
      [key: string]: string;
  };
}
