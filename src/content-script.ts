// keeps track of what script got injected
let scriptInjection = new Map<string, boolean>();

const injectScript = (path: string) => {
  if (!scriptInjection.get(path)) {

    let script = document.createElement('script');
    script.src = chrome.extension.getURL(path);
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);

    scriptInjection.set(path, true);
  }
};

// Check with background script to see if the current tab was
// already registered. If so, then this is a reload.
chrome.runtime.sendMessage({
    from: 'content-script'
  }, (response) => {
    if (response && response.connection) {
      injectScript('build/backend.js');
    }
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'init') {
    injectScript('build/backend.js');
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
    chrome.runtime.sendMessage({
      name: 'message',
      data: event.data
    });
  }
}, false);
