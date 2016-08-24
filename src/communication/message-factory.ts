import {DebugElement} from '@angular/core';

import {
  Message,
  MessageResponse,
  messageSource,
} from './message';

import {MessageType} from './message-type';

import {getRandomHash} from './hash';

import {
  Change,
  MutableTree,
  Node,
  Path,
  deserializePath,
} from '../tree';

import {
  deserialize,
  serialize
} from '../utils/serialize';

const create = <T>(properties: T) =>
  Object.assign({messageSource, messageId: getRandomHash()}, properties);

export abstract class MessageFactory {
  static initialize(options?: {showElements: boolean}): Message<void> {
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

  static completeTree(tree: MutableTree): Message<MutableTree> {
    return create({
      messageType: MessageType.CompleteTree,
      content: serialize(tree.roots),
      serialized: true,
    });
  }

  static treeDiff(changes: Change[]): Message<Change[]> {
    return create({
      messageType: MessageType.TreeDiff,
      content: serialize(changes),
      serialized: true,
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

  static routerTree(): Message<void> {
    return create({
      messageType: MessageType.RouterTree,
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

    return create({
      messageType: MessageType.Response,
      messageId: null,
      messageSource: message.messageSource,
      messageResponseId: message.messageId,
      serialized: serializeResponse,
      content: response instanceof Error ? null : prepare(),
      error: response instanceof Error ? response : null
    });
  }
}

