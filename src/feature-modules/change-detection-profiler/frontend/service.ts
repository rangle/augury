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
      switch(message.messageType) {

        case MessageType.CDP_Tick:
          this._actions.genericUpdate(Updaters.addTick(message.content.tick))
          break;

        case MessageType.CDP_MetricsPerSecond:
          this._actions.genericUpdate(Updaters.updateCyclesPerSecond(message.content.cycles))
          break;

      }
    })
  }

}
