import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';

import * as d3 from 'd3';

import {GraphUtils} from '../../utils/graph-utils';

import {ParseUtils} from '../../utils/parse-utils';

import {
  MutableTree,
  Node,
  deserializePath,
} from '../../../tree';

const START_X: number = 20;
const START_Y: number = 70;
const NODE_INCREMENT_X: number = 100;
const NODE_INCREMENT_Y: number = 60;
const NODE_RADIUS: number = 8;
const MAX_LABEL_CHARS = 14;

@Component({
  selector: 'bt-injector-tree',
  providers: [GraphUtils, ParseUtils],
  templateUrl: './injector-tree.html'
})
export class InjectorTree implements OnChanges {
  @ViewChild('graphContainer') graphContainer;

  @Input() tree: MutableTree;
  @Input() ngModules: {[key: string]: any};
  @Input() selectedNode: Node;
  @Input() selectNode: EventEmitter<any>;
  focusedComponent: number = -1;
  focusedDependency: number = -1;

  private parentHierarchy;
  private svg: any;
  breadcrumbs: Array<any>;

  constructor(
    private graphUtils: GraphUtils,
    private parseUtils: ParseUtils
  ) { }

  private onFocusNode(componentIndex: number, dependecyIndex: number) {
    this.focusedComponent = componentIndex;
    this.focusedDependency = dependecyIndex;
  }

  private onUnFocusNode() {
    this.focusedComponent = -1;
    this.focusedDependency = -1;
  }

  private unFocusNode = () => {
    this.focusedComponent = -1;
    this.focusedDependency = -1;
  }

  private onSelectComponent(component: any): void {
    this.selectNode.emit(component);
  }

  ngOnChanges() {
    if (this.tree && this.selectedNode) {
      this.displayTree();
    }
  }

  private displayTree() {
    const mainHierarchy = this.parseUtils.getParentHierarchy(this.tree, this.selectedNode, node =>
      node.isComponent === true);

    this.parentHierarchy = [{ name: 'root', dependencies: [] }].concat(mainHierarchy).concat([this.selectedNode]);

    this.breadcrumbs = this.parentHierarchy.slice(1);

    let firstChild: Element;
    while (firstChild = this.graphContainer.nativeElement.firstChild) {
      this.graphContainer.nativeElement.removeChild(firstChild);
    }

    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('height', this.parentHierarchy.length * NODE_INCREMENT_Y + 50)
      .attr('width', 1500);

    this.render();
  }

  private addNodeAndText(posX: number, posY: number, title: any, clazz: string, maxChars: number = 0,
      mouseOverFn: () => void, mouseOutFn: () => void) {
    this.graphUtils.addCircle(this.svg, posX, posY, NODE_RADIUS, clazz, mouseOverFn, mouseOutFn);
    this.graphUtils.addText(this.svg, posX - 6, posY - 15, title, maxChars);
  }

  private render() {
    if (this.tree == null) {
      return;
    }

    // render legend
    this.graphUtils.addText(this.svg, 5, 15, 'Dependency Origin');
    this.graphUtils.addLine(this.svg, 33, 30, 83, 30, 'stroke-dependency origin dashed5');
    this.graphUtils.addText(this.svg, 150, 15, 'Self Provided');
    this.graphUtils.addCircle(this.svg, 195, 30, NODE_RADIUS, 'fill-dependency stroke-dependency provided-here');

    let posX, posY, x1, y1, x2, y2;

    const nodesToDraw = [];

    this.parentHierarchy.forEach((node, hierarchyIdx: number) => {
      const nodeX = START_X;
      const nodeY = START_Y + NODE_INCREMENT_Y * hierarchyIdx;

      node.dependencies.forEach((dependency, depIndex: number) => {
        const parent = this.parseUtils.getDependencyProvider(this.tree, node.id, dependency);
        const injectorX = nodeX + NODE_INCREMENT_X + NODE_INCREMENT_X * depIndex;

        x1 = injectorX - NODE_INCREMENT_X + NODE_RADIUS;
        y1 = nodeY;
        x2 = injectorX - NODE_RADIUS;
        y2 = nodeY;
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-dependency');

        const selfProvides = parent === node;
        // draw dependency links (if injectable was provided higher than current node)
        if (!selfProvides) {
          const parentIdx = !parent ? 0 : this.parentHierarchy.reduce((prev, curr, idx, p) =>
            prev >= 0 ? prev : p[idx].name === parent.name ? idx : prev, -1);

          x1 = START_X + NODE_INCREMENT_X * (depIndex + 1);
          y1 = START_Y + hierarchyIdx * NODE_INCREMENT_Y;
          x2 = START_X;
          y2 = START_Y + NODE_INCREMENT_Y * parentIdx;

          // draw dependency origin line
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-dependency origin dashed5');
        }

        // draw injected dependency name and node circle
        nodesToDraw.push([injectorX, nodeY, dependency.name || 'no-name',
          `node-circle fill-dependency stroke-dependency ${selfProvides ? 'provided-here' : ''}`,
          depIndex === node.dependencies.length - 1 ? 0 : MAX_LABEL_CHARS,
          () => this.onFocusNode(hierarchyIdx, depIndex),
          () => this.onUnFocusNode()]);
      });

      if (hierarchyIdx > 0) {
        x1 = nodeX;
        y1 = START_Y + NODE_INCREMENT_Y * (hierarchyIdx - 1) + NODE_RADIUS;
        x2 = nodeX;
        y2 = nodeY - (20 + NODE_RADIUS);
        // draw parent to child component line
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'arrow stroke-component');
      }

      // draw component name and node circle
      nodesToDraw.push([nodeX, nodeY, node.name || 'no-name', 'node-circle fill-component stroke-component',
        hierarchyIdx === 0 || !node.dependencies.length ? 0 : MAX_LABEL_CHARS,
        () => this.onFocusNode(hierarchyIdx, -1), () => this.onUnFocusNode()]);
    });

    nodesToDraw.forEach((params) => {
      this.addNodeAndText(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
    });

    this.svg.append('defs').selectAll('marker')
      .data(['suit', 'licensing', 'resolved'])
      .enter().append('marker')
      .attr('id', (d) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5 L10,0 L0, -5')
      .style('stroke', '#000')
      .style('opacity', '0.8');
  }
}
