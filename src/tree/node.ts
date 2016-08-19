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
  nativeElement: string;
  listeners: Array<EventListener>;
  componentInstance;
  context;
  dependencies: Array<string>;
  injectors: Array<string>;
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
