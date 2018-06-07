import { Injectable } from '@angular/core';
import { select } from '@angular-redux/store';

import {
  MessagePipeFrontend, MessageType, Message } from 'feature-modules/.lib';
import {
  NodeInspectUpdaters as Updaters,
  NodeInspectSelectors as Selectors } from './state.model';
import {
  NodeInspectActions as Actions } from './actions';

@Injectable()
export class NodeInspectService {

  @select(Selectors.examples) examples;

  constructor(
    private _actions: Actions,
    private _pipe: MessagePipeFrontend,
  ) {
    this._pipe.addHandler((message: Message<any>) => {
      switch(message.messageType) {

        case MessageType.NI_SubscribeToObservable:
          console.log('NI_SubscribeToObservable');
          break;

      }
    })
  }

  addExample() {
    this._actions.genericUpdate(Updaters.addExample())
  }

  inspectNode(path: Array<number>){
    this._pipe.send({
        messageType: MessageType.NI_InspectNode,
        content: { path: path, requestInstance: true }
    })
  }

}
