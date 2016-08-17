import {Injectable} from '@angular/core';
import {BackendActions} from '../actions/backend-actions/backend-actions';
import {serialize, deserialize} from '../../utils/serialize';

@Injectable()
/**
 * Backend Messaging Service
 */
export class BackendMessagingService {

  private backgroundPageConnection: chrome.runtime.Port;

  constructor(
    private backendActions: BackendActions
  ) {

    this.backgroundPageConnection = chrome.runtime.connect();

    // This is used to start the extension only when Angular is on the page
    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    this.backgroundPageConnection.onMessage.addListener((message: any) => {
      // if this is a reload, clear selections then tree
      if (message.from && message.from === 'content-script') {
        console.log('clear selections; clear tree');
        this.backendActions.clearSelections();
        this.backendActions.clearTree();
      }

      if (message.data) {
        if (message.data.serialized) {
          console.log('Deserialize', message.data);
          message.data.message = deserialize(message.data.message);
          message.data.serialized = false;
        }

        if (message.data.message.type === 'render_routes') {
          this.backendActions.renderRouterTree(message.data.message.payload);
        } else {
          this.backendActions.componentTreeChanged(message.data.message.payload);
        }
      }
    });

  }

  /**
   * Send a message to the backend
   * @param  {Object} message
   */
  sendMessageToBackend(message) {
    this.backgroundPageConnection.postMessage({
      name: 'message',
      tabId: chrome.devtools.inspectedWindow.tabId,
      message: serialize(message),
      serialized: true
    });
  }
}
