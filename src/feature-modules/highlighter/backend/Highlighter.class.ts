// project deps
import { Message, MessageType, Node, MutableTree, MessageFactory } from '../module-dependencies.barrel';
// TODO: add to module dependencies
import { MessageQueue } from '../../../structures';
// TODO: add to module deps (should be a module on its own?)
import { send } from '../../../backend/indirect-connection';

// ----

const HIGHLIGHT_STYLES = require('to-string!raw!./highlightOverlayStyle.raw');

interface Offsets {
  left: number;
  top: number;
  width: number;
  marginWidth?: number;
  height: number;
  marginHeight?: number;
}

// ----

export class Highlighter {

  // injectables
  private _dom: Document;
  private _componentTree: MutableTree;
  private _messageQueue: MessageQueue<Message<any>>;

  // internals
  private _onHoverListener;
  private _onSelectListener;
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
  public useMessageQueueInstance(mq: MessageQueue<Message<any>>) {
    this._messageQueue = mq;
  }

  /**
   * @returns boolean
   */
  public isReady() {
    return (
      this._dom &&
      this._componentTree &&
      this._messageQueue
    );
  }

  /**
   */
  public highlightAngularNode(node: Node) {
    this.clear();
    this._currentHighlight = {
      overlay: {
        element: this.paintOverlay(this.getAngularNodeOffsets(node), node.name)
      },
      target: {
        angularNode: node,
        domElement: node.nativeElement()
      }
    };
  }

  /**
   */
  public clear() {
    if (!this._currentHighlight) { return; }
    const overlay = this._currentHighlight.overlay.element;
    try { overlay.remove(); }
    catch (e) { console.error('error removing highlight', overlay, e); }
    this._currentHighlight = null;
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
        this.highlightAngularNode(node);
        break;

      case MessageType.FindElement:
        if (this._componentTree == null) { return; }
        if (message.content.start) { this.startFinding(); }
        if (message.content.stop) { this.stopFinding(); }
        break;

    }
  }

  /**
   */
  private startFinding() {
    this.stopFinding();
    this._onHoverListener = (event) => {
      this.highlightNodeFromElement(event.target);
    };
    this._onSelectListener = (event) => {
      this.selectNodeFromElement(event.target);
      this.clear();
    };
    window.addEventListener(
      'mouseover',
      this._onHoverListener,
      false
    );
  }

  /**
   */
  private stopFinding() {
    window.removeEventListener(
      'mouseover',
      this._onHoverListener,
      false
    );
  }

  /**
   */
  private selectNodeFromElement(element) {
    const node: Node = this.findNearestAngularParent(element);
    this._messageQueue.enqueue(MessageFactory.foundDOMElement(node));
    send(MessageFactory.push());
  }

  /**
   */
  private highlightNodeFromElement(element) {
    this.clear();
    const ngNode = this.findNearestAngularParent(element);
    if (ngNode) { this.highlightAngularNode(ngNode); }
  }

  /**
   */
  private findNearestAngularParent(element): Node {

    const ne = (n: Node): Element => n.nativeElement();

    let nearestParentNode = null;
    this._componentTree.recurseAll((currentNode: Node) => {
      if (
        ne(currentNode).contains(element) &&
        (
          !nearestParentNode ||
          ne(nearestParentNode).contains(ne(currentNode))
        )
      ) { nearestParentNode = currentNode; }
    });
    return nearestParentNode;

  }

  /**
   */
  private getAngularNodeOffsets(node: Node): Offsets {
    return addUpElementAndChildrenOffsets(node.nativeElement());
  }

  /**
   */
  private paintOverlay(offsets: Offsets, label?: string): HTMLElement {
    const overlay = this._dom.createElement('div');
    overlay.setAttribute('style', HIGHLIGHT_STYLES);

    if (label) { overlay.textContent = label; }

    overlay.style.left = `${offsets.left}px`;
    overlay.style.top = `${offsets.top}px`;
    overlay.style.width = `${offsets.width}px`;
    overlay.style.height = `${offsets.height}px`;

    document.body.appendChild(overlay);

    return overlay;
  }

}

// ----

function addUpElementAndChildrenOffsets(domElement): Offsets {

  let offsets = getElementOffsets(domElement);

  const children = Array.from(domElement.children);
  if (!children.length) { return offsets; }

  let child;
  while (child = children.pop()) {
    const childOffsets = addUpElementAndChildrenOffsets(child);
    // offsets.top = Math.max(offsets.top, childOffsets.top);
    // offsets.left = Math.max(offsets.left, childOffsets.left);
    offsets.height = Math.max(offsets.height, childOffsets.height + (childOffsets.marginHeight || 0));
    offsets.width = Math.max(offsets.width, childOffsets.width + (childOffsets.marginWidth || 0));
  }

  return offsets;

}

function getElementOffsets(domElement): Offsets {

  const computedStyle = getComputedStyle(domElement);

  let offsets = {
    left: domElement.offsetLeft,
    top: domElement.offsetTop,
    width: domElement.offsetWidth,
    marginWidth: parseInt(computedStyle.marginLeft, 10) + parseInt(computedStyle.marginRight, 10),
    height: domElement.offsetHeight,
    marginHeight: parseInt(computedStyle.marginTop, 10) + parseInt(computedStyle.marginBottom, 10)
  };

  while (domElement = <HTMLElement> domElement.offsetParent) {
    offsets.left += domElement.offsetLeft;
    offsets.top += domElement.offsetTop;
  }

  return offsets;

}
