/** 
 * Create an Angular panel from the Component Tree View
 * on Chrome Development Tools window.
*/
chrome.devtools.panels.create(
  'Angular', 
  'app/images/angular.png', 
  'app/js/batarangle/frontend/batarangle.html', 
  panel => {

    panel.onShown.addListener(function(window) {
      console.log('i\'m here');
    });
    
    panel.onHidden.addListener(function() {
      //console.log('i\'m gone');
    });
  }
);
