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

var script = document.createElement('script');
script.src = chrome.extension.getURL('../../../../node_modules/rx/dist/rx.all.js');
document.documentElement.appendChild(script);
//script.parentNode.removeChild(script);

var url = chrome.extension.getURL('app/js/batarangle/backend/entry.js');
var imp = 'System.import(\'' + url + '\'); ';

var script = document.createElement('script');
script.textContent = imp;
document.documentElement.appendChild(script);
//script.parentNode.removeChild(script);
