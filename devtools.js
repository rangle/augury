var panels = chrome && chrome.devtools && chrome.devtools.panels;

// The function below is executed in the context of the inspected page.
var getPanelContents = function () {
  if (ng && ng.probe && $0) {
    //TODO: can we move this scope export into updateElementProperties
    var debugElement = getDebugElement($0);
    
    // Export debugElement to the console
    window.$debugElement = debugElement;
    
    return (function (debugElement) {
      // var panelContents = {
      //   __private__: {}
      // };

      // for (prop in debugElement) {
      //   if (debugElement.hasOwnProperty(prop)) {
      //     // if (prop.substr(0, 2) === '$$') {
      //     //   panelContents.__private__[prop] = debugElement[prop];
      //     // } else {
      //     //   panelContents[prop] = debugElement[prop];
      //     // }
          
      //     panelContents[prop] = debugElement[prop];
      //   }
      // }
      // return panelContents;
      return {
        debugElement: debugElement,
        cmpChildren: debugElement.componentViewChildren,
        cmpInstance: debugElement.componentInstance,
        elementReference: debugElement.elementRef,
        nativeElement: debugElement.nativeElement,
        parentView: debugElement._parentView
      };

    }(debugElement));
  } else {
    return {};
  }

  function getDebugElement(node) {
    var scope = ng.probe(node)

    if (!scope) {
      // Might be a child of a DocumentFragment...
      while (node && node.nodeType === 1) node = node.parentNode;
      if (node && node.nodeType === 11) node = (node.parentNode || node.host);
      return getDebugElement(node);
    }
    return scope;
  }
};

panels && panels.elements.createSidebarPane(
  "Component Inspector",
  function (sidebar) {
    panels.elements.onSelectionChanged.addListener(function updateElementProperties() {
      sidebar.setExpression("(" + getPanelContents.toString() + ")()");
    });
});

