declare let $0: HTMLElement;
declare let ng: { probe: Function };

export function getComponentContents(): Object {

  function getDebugElement(node) {
    let $a = ng.probe(node);
  
    if (!$a) {
      // Might be a child of a DocumentFragment...
      while (node && node.nodeType === 1) { 
        node = node.parentNode; 
      }
      
      if (node && node.nodeType === 11) { 
        node = (node.parentNode || node.host); 
      }
      
      return getDebugElement(node);
    }
    
    return $a;
  }

  if (ng && ng.probe && $0) {
    // TODO: can we move this scope export into updateElementProperties
    let $a = getDebugElement($0);
    
    // Export debugElement to the console
    Object.defineProperty(window, '$a', {
      configurable: true,
      value: $a
    });

    return {
      componentInstance: $a.componentInstance,
      componentViewChildren: $a.componentViewChildren,
      elementRef: $a.elementRef,
      nativeElement: $a.nativeElement,
      $a: $a
    };

  } else {
    return {};
  }
}