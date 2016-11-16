import {Property} from '../backend/utils/description';

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
  name: string;
  isComponent: boolean;
  changeDetection: string;
  description: Array<Property>;
  nativeElement: () => HTMLElement; // null on frontend
  listeners: Array<EventListener>;
  dependencies: Array<string>;
  directives: Array<string>;
  injectors: Array<string>;
  providers: Array<Property>;
  providerTokens: any;
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
