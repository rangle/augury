//project deps
import { Message, MessageType } from '../module-dependencies.barrel';

//module deps
import { getComponentTree } from './component-tree-access.singleton';

export const backendMessageHandler = (message: Message<any>) => {

  const tree = getComponentTree();

  switch (message.messageType) {

    case MessageType.Highlight:
      if (tree == null) { return; }
      console.log('got highlight message');
      // highlight(message.content.nodes.map(id => previousTree.lookup(id)));

    case MessageType.FindElement:
      if (tree == null) { return; }
      console.log('got findElement message');
      // findElement(message);

  }
}
