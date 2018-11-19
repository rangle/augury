import {
  Message,
  MessageResponse,
  Serialize,
  messageSource,
} from './message';

import {SerializeableError} from '../utils/error-handling';

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

export const create = <T>(properties: T) =>
  Object.assign({
    messageSource,
    messageId: getRandomHash(),
    serialize: Serialize.None,
  },
  properties);

export abstract class MessageFactory {
  static initialize(options?: SimpleOptions): Message<SimpleOptions> {
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

  static notNgApp(): Message<ApplicationError> {
    return create({
      messageType: MessageType.NotNgApp,
    });
  }

  static push(): Message<void> {
    return create({
      messageType: MessageType.Push,
    });
  }

  static ngVersion(ngVersion: string): Message<string> {
    return create({
      messageType: MessageType.NgVersion,
      content: ngVersion,
    });
  }

  static treeUnchanged(): Message<null> {
    return create({
      messageType: MessageType.TreeUnchanged,
      content: null,
      serialize: Serialize.None,
    });
  }

  static completeTree(tree: MutableTree): Message<Node[]> {
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

  static selectComponent(node: Node, requestInstance?: boolean): Message<{path: Path, requestInstance: boolean}> {
    return create({
      messageType: MessageType.SelectComponent,
      content: {
        path: deserializePath(node.id),
        requestInstance
      }
    });
  }

  static updateProperty(path: Path, newValue): Message<{path: Path, newValue}> {
    return create({
      messageType: MessageType.UpdateProperty,
      content: {
        path,
        newValue,
      },
    });
  }

  static updateProviderProperty(path: Path, token: number | string, propertyPath: Path, newValue):
      Message<{path: Path, token: (number | string), propertyPath: Path, newValue}> {
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

  static emitValue(path: Path, value): Message<{ path: Path; value: any; }> {
    return create({
      messageType: MessageType.EmitValue,
      content: {
        path,
        value
      }
    });
  }

  static ngModules(content: {[key: string]: any}): Message<{[key: string]: any}> {
    return create({
      messageType: MessageType.NgModules,
      content: content,
    });
  }

  static routerTree(content: Array<Route>): Message<Array<Route>> {
    return create({
      messageType: MessageType.RouterTree,
      content: content,
    });
  }

  static highlight(nodes: Array<Node>): Message<{nodes: string[]}> {
    return create({
      messageType: MessageType.Highlight,
      content: {
        nodes: nodes.map(n => n.id),
      },
    });
  }

  static findDOMElement(): Message<{start: boolean}> {
    return create({
      messageType: MessageType.FindElement,
      content: {
        start: true
      }
    });
  }

  static foundDOMElement(node: Node): Message<{node: Node, stop: boolean}> {
    return create({
      messageType: MessageType.FindElement,
      content: {
        node,
        stop: true
      },
    });
  }

  static analyticsEvent(event, desc) {
    return create({
      messageType: MessageType.GoogleTagManagerSend,
      content: {
        event,
        desc
      }
    });
  }

  static applicationError(error: ApplicationError): Message<ApplicationError> {
    return create({
      messageType: MessageType.ApplicationError,
      content: error,
    });
  }

  static errorCleared(errorTypes: ApplicationErrorType[]): Message<{ errorTypes: ApplicationErrorType[] }> {
    return create({
      messageType: MessageType.ErrorCleared,
      content: { errorTypes },
    });
  }

  static uncaughtApplicationError(error: SerializeableError): Message<ApplicationError> {
    return create({
      messageType: MessageType.ApplicationError,
      content: new ApplicationError(ApplicationErrorType.UncaughtException, error),
    });
  }

  static sendUncaughtError(error: SerializeableError, ngVersion: string): Message<any> {
    return create({
      messageType: MessageType.SendUncaughtError,
      content: {
        error,
        ngVersion,
      },
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

    const prepareError = r => ({name: r.name, message: r.message, stack: r.stack});

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
