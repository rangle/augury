// import {ComponentTree} from './core/mock-api';
// import {FrontendMessagingService} from './channel/frontend-messaging-service';


// let fms = new FrontendMessagingService();
// window.addEventListener('message', fms.sendMessage);
// fms.sendMessage({
//   componentData: ct.componentTree.first()
// });

// console.log('Batarangle Backend Started!');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Backend: Message Received:', message, sender);
  window.postMessage({ type: "BATARANGLE_CONTENT_SCRIPT", message }, "*");
  return true;
});

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "BATARANGLE_INSPECTED_APP")) {
    console.log("Content script received: ", event.data);
    chrome.runtime.sendMessage({
      name: 'message',
      data: event.data
    });
  }
}, false);
// This script runs before the <head> element is created, so we add the script
// to <html> instead.

/* Inject our compiled scripts into the inspected application */
// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/adapters/angular2.js');
// document.documentElement.appendChild(script);
// //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/adapters/base.js');
// document.documentElement.appendChild(script);
// // //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/adapters/event_types.js');
// document.documentElement.appendChild(script);
// // //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/controllers/base.js');
// document.documentElement.appendChild(script);
// // //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/controllers/dom.js');
// document.documentElement.appendChild(script);
// // //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/channel/frontend-messaging-service.js');
// document.documentElement.appendChild(script);
// // //script.parentNode.removeChild(script);

// var script = document.createElement('script');
// script.src = chrome.extension.getURL('app/js/batarangle/backend/entry.js');
// document.documentElement.appendChild(script);
// //script.parentNode.removeChild(script);

var script = document.createElement('script');
script.src = chrome.extension.getURL('../../../../node_modules/rx/dist/rx.all.js');
document.documentElement.appendChild(script);
//script.parentNode.removeChild(script);

var url = chrome.extension.getURL('app/js/batarangle/backend/entry.js');
var imp = 'System.import(\'' + url + '\'); ';
//console.log(url);
//console.log(imp);

var script = document.createElement('script');
script.textContent = imp;
document.documentElement.appendChild(script);
//script.parentNode.removeChild(script);

// setTimeout(() => {
//   window.postMessage({ type: "BATARANGLE_CONTENT_SCRIPT", text: "Start inspecting" }, "*");
// }, 3000);


