import {Injectable} from 'angular2/angular2';
import {BackendActions} from '../actions/backend-actions/backend-actions';

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

    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    this.backgroundPageConnection.onMessage.addListener((message: any) => {
      console.log('Frontend: Received message from Backend: ', message);
      this.backendActions.componentTreeChanged(message.data.message.payload);
    });

  }

  /**
   * Send a message to the backend
   * @param  {Object} message
   */
  sendMessageToBackend(message) {

    console.log('Frontend: sending message to Backend: ', message);
    this.backgroundPageConnection.postMessage({
      name: 'message',
      tabId: chrome.devtools.inspectedWindow.tabId,
      message: message
    });

  }

}
