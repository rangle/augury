declare let $0: HTMLElement;
declare let ng: { probe: Function };

function getPanelContents(): Object {
  
  function getDebugElement(node) {
    let debugElement = ng.probe(node);
  
    if (!debugElement) {
      // Might be a child of a DocumentFragment...
      while (node && node.nodeType === 1) { 
        node = node.parentNode; 
      }
      
      if (node && node.nodeType === 11) { 
        node = (node.parentNode || node.host); 
      }
      
      return getDebugElement(node);
    }
    
    return debugElement;
  }

  if (ng && ng.probe && $0) {
    // TODO: can we move this scope export into updateElementProperties
    let debugElement = getDebugElement($0);
    
    // Export debugElement to the console
    Object.defineProperty(window, '$debugElement', {
      configurable: true,
      value: debugElement
    });

    return {
      debugElement: debugElement,
      cmpChildren: debugElement.componentViewChildren,
      cmpInstance: debugElement.componentInstance,
      elementReference: debugElement.elementRef,
      nativeElement: debugElement.nativeElement,
      parentView: debugElement._parentView
    };

  } else {
    return {};
  }
}

chrome.devtools.panels.elements.createSidebarPane(
  'Component Inspector',
  sidebar => {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(
      () => sidebar.setExpression('(' + getPanelContents.toString() + ')()')
    );
});

