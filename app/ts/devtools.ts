import {getComponentContents} from './batarangle/component-inspector/component-inspector';

/** 
 * Create Component Inspector sidebar pane on the Element panel
 * on Chrome Development Tools window.
*/

chrome.devtools.panels.elements.createSidebarPane(
  'Component Inspector',
  sidebar => {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(
      () => sidebar.setExpression('(' + getComponentContents.toString() + ')()')
    );
  });

/**
 * Create an Angular panel from the Component Tree View
 * on Chrome Development Tools window.
*/
chrome.devtools.panels.create(
  'Angular2',
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
