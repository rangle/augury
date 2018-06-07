import { MessagePipeBackend, MessageType, Message } from 'feature-modules/.lib';

// module deps
import { MutableTree, Node, Path } from '../module-dependencies.barrel';

export class NodeInspect {

  // injectables
  private _pipe: MessagePipeBackend;
  private _componentTree: MutableTree;

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
      switch (message.messageType) {

        case MessageType.NI_InspectNode:
          const path: Path = message.content.path;
          const node = this._componentTree.traverse(path);
          // TODO: this.consoleReference(node);
          // TODO:   return getComponentInstance(previousTree, node);
          console.log('NI_InspectNode', node)
          break

        case MessageType.NI_SubscribeToObservable:
          console.log('NI_SubscribeToObservable')
          break

        case MessageType.NI_ObservableEmission:
          console.log('NI_ObservableEmission')
          break

      }
    });
  }

}
