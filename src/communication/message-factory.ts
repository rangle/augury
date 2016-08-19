import {DebugElement} from '@angular/core';

import {
  Message,
  MessageResponse,
  messageSource,
} from './message';

import {MessageType} from './message-type';

import {getUniqueIdentifier} from './identifier';

import {
  Change,
  MutableTree,
} from '../tree';

import {
  deserialize,
  serialize
} from '../utils/serialize';

const create = <T>(properties: T) =>
  Object.assign({messageSource, messageId: getUniqueIdentifier()}, properties);

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

  static completeTree(root: DebugElement, tree: MutableTree): Message<MutableTree> {
    return create({
      messageType: MessageType.CompleteTree,
      content: serialize(tree.root),
    });
  }

  static treeDiff(root: DebugElement, changes: Change[]): Message<Change[]> {
    return create({
      messageType: MessageType.TreeDiff,
      content: serialize(changes),
    });
  }

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