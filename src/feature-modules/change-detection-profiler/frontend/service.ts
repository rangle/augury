import { Injectable } from '@angular/core';
import { select } from '@angular-redux/store';

import {
  MessagePipeFrontend, MessageType, Message, merge } from 'feature-modules/.lib';
import {
  ChangeDetectionProfilerUpdaters as Updaters,
  ChangeDetectionProfilerSelectors as Selectors } from './state.model';
import {
  ChangeDetectionProfilerActions as Actions } from './actions';

@Injectable()
export class ChangeDetectionProfilerService {

  constructor(
    private _actions: Actions,
    private _pipe: MessagePipeFrontend,
  ) {
    this._pipe.addHandler((message: Message<any>) => {
      console.log(message);
      switch(message.messageType) {

        case MessageType.CDP_Tick:
          this._actions.genericUpdate(Updaters.addTick(message.content.tick))
          break;

        case MessageType.CDP_MetricsPerSecond:
          this._actions.genericUpdate(Updaters.updateCyclesPerSecond(message.content.cycles))
          break;

        case MessageType.CDP_QueuedTask:
          this._actions.genericUpdate(Updaters.updateTaskQueue(message.content.queue))
          break;

        case MessageType.CDP_DequeuedTask:
          this._actions.genericUpdate(Updaters.updateTaskQueue(message.content.queue))
          break;

      }
    })
  }

}
