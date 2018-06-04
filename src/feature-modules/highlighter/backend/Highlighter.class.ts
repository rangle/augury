//project deps
import { Message, MessageType, Node, MutableTree } from '../module-dependencies.barrel';

// ----

const HIGHLIGHT_STYLES = require('to-string!raw!./highlightOverlayStyle.raw');

interface Offsets {
  left: number;
  top: number;
  width: number;
  height: number;
}

// ----

export class Highlighter {

  private _dom: Document;
  private _componentTree: MutableTree;

  private _currentHighlight: {
    overlay: {
      element: HTMLElement;
    };
    target: {
      domElement: HTMLElement;
      angularNode: Node;
    };
  };

  constructor() { }

  /**
   * @returns boolean
   */
  public isReady() {
    return this._dom && this._componentTree;
  }

  /**
   */
  public highlightAngularNode(node: Node) {
    this.clear()
    this._currentHighlight = {
      overlay: {
        element: this.paintOverlay(this.getDOMElementOffsets(node.nativeElement()), node.name)
      },
      target: {
        angularNode: node,
        domElement: node.nativeElement()
      }
    }
  }

  /**
   */
  public clear() {
    if (!this._currentHighlight) return;
    const overlay = this._currentHighlight.overlay.element;
    try { overlay.remove(); }
    catch (e) { console.error('error removing highlight', overlay); }
    this._currentHighlight = null;
  };

  /**
   */
  public useDocumentInstance(dom: Document) {
    this._dom = dom;
  }

  /**
   */
  public useComponentTreeInstance(componentTree: MutableTree) {
    this._componentTree = componentTree;
  }

  /**
   */
  public handleMessage(message) {
    switch (message.messageType) {

      case MessageType.Highlight:
        if (this._componentTree == null) { return; }
        const id: string = message.content.nodes[0];
        if (!id) { return; }
        const node: Node = this._componentTree.lookup(id);
        this.highlightAngularNode(node)

      case MessageType.FindElement:
        if (this._componentTree == null) { return; }
        console.log('got findElement message');
        // findElement(message);

    }
  }

  /**
   */
  private getDOMElementOffsets(domElement): Offsets {
    const offsets = {
      left: domElement.offsetLeft,
      top: domElement.offsetTop,
      width: domElement.offsetWidth,
      height: domElement.offsetHeight
    };

    while (domElement = domElement.offsetParent) {
      offsets.left += domElement.offsetLeft;
      offsets.top += domElement.offsetTop;
    }

    return offsets;
  }

  /**
   */
  private paintOverlay(offsets: Offsets, label?: string): HTMLElement {
    const overlay = this._dom.createElement('div');
    overlay.setAttribute('style', HIGHLIGHT_STYLES);

    if (label) {
      overlay.textContent = label;
    }

    overlay.style.left = `${offsets.left}px`;
    overlay.style.top = `${offsets.top}px`;
    overlay.style.width = `${offsets.width}px`;
    overlay.style.height = `${offsets.height}px`;

    document.body.appendChild(overlay);

    return overlay;
  };

}
