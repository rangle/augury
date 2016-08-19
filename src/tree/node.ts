export interface EventListener {
  name: string;
  callback: Function;
}

export interface Node {
  id: string;
  nativeElement: string;
  listeners: Array<EventListener>;
  componentInstance;
  context;
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
