import {DomController} from '../controllers/dom';
import {Angular2Adapter} from '../adapters/angular2';

// window.postMessage({ type: "BATARANGLE_INSPECTED_APP", text: "Loaded channel/frontend-messaging-service.js" }, "*");

export class FrontendMessagingService {

  constructor() {

    //console.log('Backend: Constructing Listener');

    window.addEventListener("message", function(event) {
      // We only accept messages from ourselves
      if (event.source != window)
        return;

      if (event.data.type && (event.data.type == "BATARANGLE_CONTENT_SCRIPT")) {
        console.log("Inspected script received: ", event.data);
              
        let channel = {
          sendMessage: (message) => {
            return window.postMessage({ type: "BATARANGLE_INSPECTED_APP", message }, "*");
          }
        };
    
        // fixed (order matters, i.e. timing of subscrube)
        let adapter = new Angular2Adapter();
        let dom = new DomController(adapter, channel);
        dom.hookIntoBackend();
        adapter.setup();

        return true;
      }
    }, false);
      
    //console.log('Backend: Received message from Frontend', message);

  }
  
  //this.sendMessage({text: 'Hey I can send message to frontend!'})
  
  // sendMessage(message) {
    
  //   console.log('Backend: Sending message to Frontend', message);
    
  //   chrome.runtime.sendMessage({
  //     name: 'message',
  //     message: message
  //   });
  // }
}