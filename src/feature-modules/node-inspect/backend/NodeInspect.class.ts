import { MessagePipeBackend, MessageType, Message } from 'feature-modules/.lib';

// module deps
import { MutableTree, Node, Path } from '../module-dependencies.barrel';

export class NodeInspect {

  // injectables
  private _pipe: MessagePipeBackend;
  private _componentTree: MutableTree;

  // internals
  private _inspected: {
    node: Node;
    element: Element;
    componentInstance: any;
  }

  constructor() { }


  // --- Public Methods ---

  /**
   * @returns boolean
   */
  public isReady() {
    return (
      !!this._pipe &&
      !!this._componentTree
    );
  }

  // --- Injectables ----

  /**
   */
  public useComponentTreeInstance(componentTree: MutableTree) {
    this._componentTree = componentTree;
  }

  /**
   */
  public useMessagePipe(pipe: MessagePipeBackend) {
    this._pipe = pipe;
    this._pipe.addHandler((message: Message<any>) => {

      // TODO: get these out of here..

      let props;

      const getType = (thing) => {
        if ( typeof thing === 'object' && thing !== null ) {
          return thing.__proto__.constructor.name
        }
        else return typeof thing
      }

      switch (message.messageType) {

        case MessageType.NI_InspectNode:

          const path: Path = message.content.path;
          const node = this._componentTree.traverse(path);

          this._inspected = {
            node,
            element: node.nativeElement(),
            componentInstance: node.angularNode(),
          };

          props = Object.keys(this._inspected.componentInstance) // TODO: this assumes every val at path is an object (only for demo)
            .map( prop => ({ prop, type: getType(this._inspected.componentInstance[prop]) }) )

          this._pipe.sendSimpleMessage(
            this._pipe.createMessage({
              messageType: MessageType.NI_ShallowProps,
              content: { props }
            })
          )

          // TODO: this.consoleReference(node);
          // TODO:   return getComponentInstance(previousTree, node);
          console.log('NI_InspectNode', this._inspected)
          break

        case MessageType.NI_GetPropsAtPath:

          const key: string = message.content.path; // TODO: path should be an array
          const valAtPath: any = this._inspected.componentInstance[key]

          props = Object.keys(valAtPath) // TODO: this assumes every val at path is an object (only for demo)
            .map( prop => ({ prop, type: getType(valAtPath[prop]) }) )

          this._pipe.sendSimple({
            messageType: MessageType.NI_ShallowProps,
            content: { props }
          })

          break

        case MessageType.NI_SubscribeToObservable:

          const x: string = message.content.path; // TODO: path should be an array
          const obs: any = this._inspected.componentInstance[x]

          // TODO: observable subscriptions, as well as inspected nodes,
          //       should have ids, so that we have inspect/sub to multiple simultaneously
          obs.subscribe(val => {
            this._pipe.sendSimple({
              messageType: MessageType.NI_ObservableEmission,
              content: { value: val }
            })
          })

          break

        case MessageType.NI_ObservableEmission:
          console.log('NI_ObservableEmission')
          break

      }
    });
  }

}
