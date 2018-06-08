import { Injectable } from '@angular/core';
import { select } from '@angular-redux/store';

import {
  MessagePipeFrontend, MessageType, Message, merge } from 'feature-modules/.lib';
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

        case MessageType.NI_ShallowProps:
          this._actions.genericUpdate(state => merge(state, { examples: message.content.props }))
          break;

        case MessageType.NI_PropsAtPath:
          this._actions.genericUpdate(state => merge(state, { examples: message.content.props }))
          break;

        case MessageType.NI_ObservableEmission:
          this._actions.genericUpdate(state => merge(state, { examples: message.content.value }))
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

  subscribeToObservableAtPath(path) {
    this._pipe.send({
      messageType: MessageType.NI_SubscribeToObservable,
      content: { path }
    })
  }

  getPropsAtPath(prop) {
    /*
    this._pipe.handleImmediate({
      messageType: MessageType.NI_GetPropsAtPath,
      content: { path: key }
    }).then(children => {
      this._actions.genericUpdate(state => merge(state, { examples: children }))
    })
    */
    this._pipe.send({
      messageType: MessageType.NI_GetPropsAtPath,
      content: { path: prop.prop } // TODO: ... prop.prop....
    })
  }

}
