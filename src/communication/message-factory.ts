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
  Change,
  MutableTree,
  Node,
  Path,
  deserializePath,
} from '../tree';

import {
  serialize,
  serializeBinary,
} from '../utils';

import {SimpleOptions} from '../options';

const completeMessage = <T>(properties): Message<T> => Object.assign({
  messageId: getRandomHash(),
  messageSource,
  serialize: Serialize.None
}, properties);

export abstract class MessageFactory {
  static initialize(options?: SimpleOptions): Message<SimpleOptions> {
    return completeMessage<SimpleOptions>({
      messageType: MessageType.Initialize,
      content: options,
    });
  }

  static frameworkLoaded(): Message<void> {
    return completeMessage<void>({
      messageType: MessageType.FrameworkLoaded,
    });
  }

  static ping(): Message<void> {
    return completeMessage<void>({
      messageType: MessageType.Ping,
    });
  }

  static push(): Message<void> {
    return completeMessage<void>({
      messageType: MessageType.Push,
    });
  }

  static completeTree(tree: MutableTree): Message<MutableTree> {
    return completeMessage<MutableTree>({
      messageType: MessageType.CompleteTree,
      serialize: Serialize.None,
      content: tree.roots,
    });
  }

  static treeDiff(changes: Array<Change>): Message<Array<Change>> {
    return completeMessage<Array<Change>>({
      messageType: MessageType.TreeDiff,
      serialize: Serialize.None,
      content: changes,
    });
  }

  static selectComponent(node: Node, requestInstance?: boolean): Message<any> {
    return completeMessage<any>({
      messageType: MessageType.SelectComponent,
      content: {
        path: deserializePath(node.id),
        requestInstance
      }
    });
  }

  static updateProperty(path: Path, newValue): Message<{path: Path, newValue: any}> {
    return completeMessage<{path: Path, newValue: any}>({
      messageType: MessageType.UpdateProperty,
      content: {
        path,
        newValue,
      }
    });
  }

  static emitValue(path: Path, value): Message<{path: Path, value: any}> {
    return completeMessage<{path: Path, value: any}>({
      messageType: MessageType.EmitValue,
      content: {
        path,
        value
      }
    });
  }

  static routerTree(content: Array<MainRoute>): Message<Array<MainRoute>> {
    return completeMessage<Array<MainRoute>>({
      messageType: MessageType.RouterTree,
      content: content,
    });
  }

  static highlight(nodes: Array<Node>): Message<any> {
    return completeMessage<any>({
      messageType: MessageType.Highlight,
      content: {
        nodes: nodes.map(n => n.id),
      },
    });
  }

  static applicationError(error: ApplicationError): Message<ApplicationError> {
    return completeMessage<ApplicationError>({
      messageType: MessageType.ApplicationError,
      content: error,
    });
  }

  /// Wrap a message in a DispatchWrapper so that we know to post it to the browser event
  /// queue instead of posting it to the Chrome communication channel. A message wrapped
  /// in this way takes a different path than a normal message.
  static dispatchWrapper<T>(message: Message<T>): Message<Message<T>> {
    return completeMessage<Message<T>>({
      messageType: MessageType.DispatchWrapper,
      content: message,
    });
  }

  static response<Response, T>(
    message: Message<T>,
    response: Response,
    serializeResponse: boolean): MessageResponse<Response> {
    const prepare = (): any => {
      if (serializeResponse) {
        return serialize(response);
      }
      return response;
    };

    const prepareError = r => (<Error>{name: r.name, message: r.message, stack: r.stack});

    const serialization = serializeResponse ? Serialize.Recreator : Serialize.None;

    return <MessageResponse<Response>> {
      messageId: getRandomHash(),
      messageType: MessageType.Response,
      messageSource: message.messageSource,
      messageResponseId: message.messageId,
      serialize: serialization,
      content: response instanceof Error ? undefined : prepare(),
      error: response instanceof Error ? prepareError(<any>response) : undefined
    };
  }
}
