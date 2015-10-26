import {DomController} from './controllers/dom';
import {Angular2Adapter} from './adapters/angular2';

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