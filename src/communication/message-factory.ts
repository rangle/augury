import {
  Message,
  MessageResponse,
  Serialize,
  messageSource,
} from './message';

import {
  MainRoute,
} from '../backend/utils';

import {MessageType} from './message-type';

import {ApplicationError} from './application-error';

import {getRandomHash} from './hash';

import {
  Path,
  deserializePath,
} from '../tree/path';
import { MutableTree } from '../tree/mutable-tree';
import { Change } from '../tree/change';
import { Node } from '../tree/node';

import {
  serialize,
  serializeBinary,
} from '../utils';

import {SimpleOptions} from '../options';

const create = <T>(properties: T) =>
  Object.assign({
    messageSource,
    messageId: getRandomHash(),
    serialize: Serialize.None,
  },
  properties);

export abstract class MessageFactory {
  static initialize(options?: SimpleOptions): Message<void> {
    return create({
      messageType: MessageType.Initialize,
      content: options,
    });
  }

  static frameworkLoaded(): Message<void> {
    return create({
      messageType: MessageType.FrameworkLoaded,
    });
  }

  static ping(): Message<void> {
    return create({
      messageType: MessageType.Ping,
    });
  }

  static push(): Message<void> {
    return create({
      messageType: MessageType.Push,
    });
  }

  static completeTree(tree: MutableTree): Message<MutableTree> {
    return create({
      messageType: MessageType.CompleteTree,
      content: tree.roots,
      serialize: Serialize.None,
    });
  }

  static treeDiff(changes: Change[]): Message<Change[]> {
    return create({
      messageType: MessageType.TreeDiff,
      content: changes,
      serialize: Serialize.None,
    });
  }

  static selectComponent(node: Node, requestInstance?: boolean): Message<string> {
    return create({
      messageType: MessageType.SelectComponent,
      content: {
        path: deserializePath(node.id),
        requestInstance
      }
    });
  }

  static updateProperty(path: Path, newValue): Message<void> {
    return create({
      messageType: MessageType.UpdateProperty,
      content: {
        path,
        newValue,
      }
    });
  }

  static emitValue(path: Path, value): Message<void> {
    return create({
      messageType: MessageType.EmitValue,
      content: {
        path,
        value
      }
    });
  }

  static routerTree(content: Array<MainRoute>): Message<void> {
    return create({
      messageType: MessageType.RouterTree,
      content: content,
    });
  }

  static highlight(nodes: Array<Node>): Message<Node[]> {
    return create({
      messageType: MessageType.Highlight,
      content: {
        nodes: nodes.map(n => n.id),
      },
    });
  }

  static selectDOMNode(): Message<void> {
    return create({
      messageType: MessageType.SelectDOMNode,
      content: {}
    });
  }

  static endDOMSelection(): Message<void> {
    return create({
      messageType: MessageType.EndDOMSelection,
      content: {},
    });
  }

  static selectTreeNode(node: Node): Message<void> {
    return create({
      messageType: MessageType.SelectTreeNode,
      content: node,
    });
  }

  static applicationError(error: ApplicationError): Message<ApplicationError> {
    return create({
      messageType: MessageType.ApplicationError,
      content: error,
    });
  }

  /// Wrap a message in a DispatchWrapper so that we know to post it to the browser event
  /// queue instead of posting it to the Chrome communication channel. A message wrapped
  /// in this way takes a different path than a normal message.
  static dispatchWrapper<T>(message: Message<T>): Message<Message<T>> {
    return create({
      messageType: MessageType.DispatchWrapper,
      content: message,
    });
  }

  static response<Response, T>(message: Message<T>, response: Response,
      serializeResponse: boolean): MessageResponse<Response> {
    const prepare = (): any => {
      if (serializeResponse) {
        return serialize(response);
      }
      return response;
    };

    const prepareError = r => ({message: r.message, stack: r.stack});

    const serialization = serializeResponse
      ? Serialize.Recreator
      : Serialize.None;

    return create({
      messageType: MessageType.Response,
      messageId: null,
      messageSource: message.messageSource,
      messageResponseId: message.messageId,
      serialize: serialization,
      content: response instanceof Error ? null : prepare(),
      error: response instanceof Error ? prepareError(response) : null
    });
  }
}
