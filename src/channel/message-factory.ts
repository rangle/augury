import {DebugElement} from '@angular/core';

import {Message} from './message';

import {MessageType} from './message-type';

import {
  Change,
  Tree,
} from '../tree';

export abstract class MessageFactory {
  static initialize(): Message<void> {
    return {
      messageType: MessageType.Initialize,
    };
  }

  static frameworkLoaded(): Message<void> {
    return {
      messageType: MessageType.FrameworkLoaded,
    }
  }

  static completeTree(root: DebugElement, tree: Tree): Message<Tree> {
    return {
      messageType: MessageType.CompleteTree,
      message: tree,
    };
  }

  static treeDiff(root: DebugElement, changes: Change[]): Message<Change[]> {
    return {
      messageType: MessageType.TreeDiff,
      message: changes,
    };
  }
}