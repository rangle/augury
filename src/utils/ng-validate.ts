function checkValidApp() {
  if (window && window.hasOwnProperty('ng')) {
    window.postMessage({ type: 'AUGURY_NG_VALID' }, '*');
  }
}
setTimeout(checkValidApp, 250);
