// var script = document.createElement('script');
// script.src = chrome.extension.getURL('build/entry.js');
// document.documentElement.appendChild(script);
// script.parentNode.removeChild(script);

let count = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Backend: Message Received:', message, sender);

  // Need to investigate why when moving the injection block 
  // out of the addListener scope does not work.
  // I would think that having the commented out block at the top of this 
  // file is all we need to kick start the messaging process.
  if (message.name === 'init') {

    if (count === 0) {

      let script = document.createElement('script');
      script.src = chrome.extension.getURL('build/entry.js');
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);

      count++;
    }

    return;
  }

  window.postMessage({ type: 'BATARANGLE_CONTENT_SCRIPT', message }, '*');
  return true;
});

window.addEventListener('message', function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'BATARANGLE_INSPECTED_APP')) {
    console.log('Content script received: ', event.data);
    chrome.runtime.sendMessage({
      name: 'message',
      data: event.data
    });
  }
}, false);
