import {Property} from '../backend/utils/description';

export interface EventListener {
  name: string;
  callback: Function;
}

export interface Binding {
  variable: string;
  boundTo: string;
}

export interface Node {
  id: string;
  isComponent: boolean;
  description: Array<Property>;
  nativeElement: () => HTMLElement; // null on frontend
  listeners: Array<EventListener>;
  dependencies: Array<string>;
  injectors: Array<string>;
  providers: Array<Property>;
  input: Array<Binding>;
  output: Array<Binding>;
  source: string;
  name: string;
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
