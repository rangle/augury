import {
  Message,
  MessageResponse,
  Serialize,
  messageSource,
} from './message';

import {
  Route,
} from '../backend/utils';

import {MessageType} from './message-type';

import {
  ApplicationError,
  ApplicationErrorType,
} from './application-error';

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

  static notNgApp(): Message<void> {
    return create({
      messageType: MessageType.NotNgApp,
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

  static updateProperty(path: Path, newValue): Message<{path: string, newValue}> {
    return create({
      messageType: MessageType.UpdateProperty,
      content: {
        path,
        newValue,
      },
    });
  }

  static updateProviderProperty(path: Path, token: number | string, propertyPath: Path, newValue):
      Message<{path: Path, token: string, propertyPath: Path, newValue}> {
    return create({
      messageType: MessageType.UpdateProviderProperty,
      content: {
        path,
        token,
        propertyPath,
        newValue,
      },
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

  static ngModules(content: {[key: string]: any}): Message<void> {
    return create({
      messageType: MessageType.NgModules,
      content: content,
    });
  }

  static routerTree(content: Array<Route>): Message<void> {
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

  static findDOMElement(): Message<void> {
    return create({
      messageType: MessageType.FindElement,
      content: {
        start: true
      }
    });
  }

  static foundDOMElement(node: Node): Message<void> {
    return create({
      messageType: MessageType.FindElement,
      content: {
        node,
        stop: true
      },
    });
  }

  static applicationError(error: ApplicationError): Message<ApplicationError> {
    return create({
      messageType: MessageType.ApplicationError,
      content: error,
    });
  }

  static uncaughtApplicationError(error: Error): Message<ApplicationError> {
    return create({
      messageType: MessageType.ApplicationError,
      content: serialize(new ApplicationError(ApplicationErrorType.UncaughtException, error)),
      serialize: Serialize.Recreator,
    });
  }

  static sendUncaughtError(error: Error): Message<Error> {
    return create({
      messageType: MessageType.SendUncaughtError,
      content: serialize(error),
      serialize: Serialize.Recreator,
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
