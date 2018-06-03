//project deps
import { Message, MessageType, Node, MutableTree } from '../module-dependencies.barrel';

// ----

const HIGHLIGHT_STYLES = require('to-string!raw!./highlighter.raw');

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
    domElement: HTMLElement;
    angularNode: Node;
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
  public selectAngularNode(node:) {
    this.clear()

  }

  /**
   */
  public clear() {
    if (!this._currentHighlight) return;
    const el = this._currentHighlight.domElement;
    try { el.remove(); }
    catch (e) { console.error('error removing highlight', el); }
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
        console.log('got highlight message');
        // highlight(message.content.nodes.map(id => previousTree.lookup(id)));

      case MessageType.FindElement:
        if (this._componentTree == null) { return; }
        console.log('got findElement message');
        // findElement(message);

    }
  }

  /**
   */
  private getNodeOffsets(node): Offsets {
    const offsets = {
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight
    };

    while (node = node.offsetParent) {
      offsets.left += node.offsetLeft;
      offsets.top += node.offsetTop;
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
