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
} from '../tree';

import {
  deserialize,
  serialize
} from '../utils/serialize';

const create = <T>(properties: T) =>
  Object.assign({messageSource, messageId: getRandomHash()}, properties);

export abstract class MessageFactory {
  static initialize(): Message<void> {
    return create({
      messageType: MessageType.Initialize,
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
    });
  }

  static treeDiff(changes: Change[]): Message<Change[]> {
    return create({
      messageType: MessageType.TreeDiff,
      content: serialize(changes),
    });
  }

  static selectComponent(node: Node): Message<string> {
    return create({
      messageType: MessageType.SelectComponent,
      content: node.id,
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

  static response<Response, T>(message: Message<T>, response: Response): MessageResponse<Response> {
    return create({
      messageType: MessageType.Response,
      messageId: null,
      messageSource: message.messageSource,
      messageResponseId: message.messageId,
      content: response instanceof Error ? null : response,
      error: response instanceof Error ? response : null
    });
  }
}