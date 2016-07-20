import {Component, NgZone, Input} from '@angular/core';
import {NgIf, NgFor} from '@angular/common';
import {ComponentDataStore} from
  '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';

// NOTE(cbond): This template must remain inline, there is a bug with recursive
// controls in Angular 2 and templateUrl that prevents this from working
// otherwise. Once they fix that bug then this can be placed back inside a
// templateUrl file.
@Component({
  selector: 'bt-node-item',
  template: `
    <div (mouseout)=onMouseOut($event)
      (mouseover)=onMouseOver($event)
      (dblclick)=onDblClick($event)
      (click)="onClick($event)">
    
      <div class="node-item pl3 rounded border-box"
        [ngClass]="{'node-item-selected':isSelected,'changed': isUpdated}">
        <img src="../images/Triangle.svg"
          style="width: 0.8em; height: 0.8em;"
          [hidden]="node.children ? false : true"
          [ngClass]="{rotate90: showChildren()}"
          (click)="expandTree($event)">
        <div class="inline"
          [innerHTML]="getNodeDetails(node)">
        </div>
      </div>
    
      <div class="border-box pl4" *ngIf="node.isOpen || wasRendered">
        <bt-node-item *ngFor="let node of node.children"
          [changedNodes]="changedNodes"
          [hidden]="showChildren()"
          [selectedNode]="selectedNode"
          [closedNodes]="closedNodes"
          [allowedComponentTreeDepth]="allowedComponentTreeDepth"
          [node]="node">
        </bt-node-item>
      </div>
    </div>`,
  directives: [NgIf, NgFor, NodeItem]
})

/**
 * Node Item
 * Renders a node in the Component Tree View
 * (see ../tree-view.ts)
 */
export class NodeItem {
  @Input() node: any;
  @Input() changedNodes: any;
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;
  @Input() allowedComponentTreeDepth: number;

  private collapsed: any;
  private isUpdated: boolean = false;
  private isSelected: boolean = false;

  // Perf: if the node was already rendered keep it in the component tree
  // even if it is hidden.
  private wasRendered: boolean = false;

  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {
  }

  ngOnInit() {
    // if the tree is too deep stop opening and rendering the tree.
    this.node.isOpen = this.isDepthLimitReached() ? false : this.node.isOpen;

    // the deeper the rendering goes, the closer the rendering comes to
    // reaching the limit. Pass this value recursively to sub nodes.
    this.allowedComponentTreeDepth -= 1;
  }

  // Return true if the component tree should no longer be opening
  // its nodes by default, if false keep expanding the tree.
  isDepthLimitReached(): boolean {
    return this.allowedComponentTreeDepth <= 0;
  }

  getNodeDetails(node) {

    let html = '';
    html += '<p class="node-item-name">' + node.name + '</p>';
    if (node.description && node.description.length) {
      html += '<span class="node-item-description">(';
      for (let i = 0; i < node.description.length; i++) {
        const desc = node.description[i];
        html += '<p class="node-item-property">' + desc.key + '=</p>';
        html += '<p class="node-item-value">"' + desc.value + '"</p>';
        if (i < node.description.length - 1) {
          html += '<span>, </span>';
        }
      }
      html += ')</span>';
    }

    return html;
  }

  /**
   * Select the element in inspect window on double click
   * @param  {Object} $event
   */
  onDblClick($event) {
    let evalStr = 'inspect($$(\'body [augury-id=\"' +
      this.node.id + '\"]\')[0])';

    chrome.devtools.inspectedWindow.eval(
      evalStr,
      function(result, isException) {
        if (isException) {
          console.log(isException);
        }
      }
    );

    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * Select this node on click
   * @param  {Object} $event
   */
  onClick($event) {
    this.userActions.selectNode({ node: this.node });
    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * Dispatch clear highlight action on node mouse out
   * @param  {Object} $event
   */
  onMouseOut($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.userActions.clearHighlight();
  }

  /**
   * Dispatch element highlight action on node mouse over
   * @param  {Object} $event
   */
  onMouseOver($event) {
    this.userActions.highlight({ node: this.node });
    $event.preventDefault();
    $event.stopPropagation();
  }

  showChildren() {
    return !this.node.isOpen;
  }

  /**
   * Expand or Collapse tree based on current state on click
   * @param  {Object} $event
   */
  expandTree($event) {
    this.node.isOpen = !this.node.isOpen;
    this.userActions.openCloseNode({ node: this.node });

    // if the disclosure arrow on the component node was clicked
    // it was rendered.
    this.wasRendered = true;
    $event.preventDefault();
    $event.stopPropagation();
  }

  ngOnChanges(changes) {
    if (this.selectedNode && this.node) {
      this.isSelected = (this.selectedNode.id === this.node.id);
    }
    if (changes.changedNodes && this.node) {
      this.isUpdated = this.changedNodes.indexOf(this.node.id) > 0;
      setTimeout(() => {
        this.isUpdated = false;
      }, 2000);
    }
    if (this.closedNodes && this.node) {
      if (this.closedNodes.indexOf(this.node.id) > -1) {
        this.node.isOpen = false;
      }
    }
  }
}
