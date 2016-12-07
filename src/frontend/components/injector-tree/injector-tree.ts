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
const START_Y: number = 30;
const NODE_INCREMENT_X: number = 100;
const NODE_INCREMENT_Y: number = 60;
const NODE_RADIUS: number = 8;

@Component({
  selector: 'bt-injector-tree',
  providers: [GraphUtils, ParseUtils],
  template: require('./injector-tree.html')
})
export class InjectorTree implements OnChanges {
  @ViewChild('graphContainer') graphContainer;

  @Input() tree: MutableTree;
  @Input() selectedNode: Node;
  @Input() selectNode: EventEmitter<any>;

  private parentHierarchy;
  private svg: any;

  constructor(
    private graphUtils: GraphUtils,
    private parseUtils: ParseUtils
  ) { }

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

  private addNodeAndText(posX: number, posY: number, title: any, clazz: string) {
      this.graphUtils.addCircle(this.svg, posX, posY, NODE_RADIUS, clazz);
      this.graphUtils.addText(this.svg, posX - 6, posY - 15, title);
  }

  private render() {
    if (this.tree == null) {
      return;
    }

    let posX, posY, x1, y1, x2, y2;

    this.parentHierarchy.forEach((node, hierarchyIdx: number) => {
      const nodeX = START_X;
      const nodeY = START_Y + NODE_INCREMENT_Y * hierarchyIdx;

      node.dependencies.forEach((dependency, j: number) => {
        const injectorX = nodeX + NODE_INCREMENT_X + NODE_INCREMENT_X * j;

        x1 = injectorX - NODE_INCREMENT_X + NODE_RADIUS;
        y1 = nodeY;
        x2 = injectorX - NODE_RADIUS;
        y2 = nodeY;
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-service');

        this.addNodeAndText(injectorX, nodeY, dependency.type, 'fill-service stroke-service');

      });

      if (hierarchyIdx > 0) {
        x1 = nodeX;
        y1 = START_Y + NODE_INCREMENT_Y * (hierarchyIdx - 1) + NODE_RADIUS;
        x2 = nodeX;
        y2 = nodeY - (20 + NODE_RADIUS);
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'arrow stroke-component');
      }

      // draw dependency links (if injectable was provided higher than current node)
      node.dependencies.forEach((dependency: any, depIndex: number) => {
        const providedForSelf = node.providers.reduce((prev, curr, idx, p) =>
          prev ? prev : p[idx].key === dependency.type && dependency.decorators.indexOf('@SkipSelf') < 0, false);
        if (providedForSelf) {
          return;
        }

        const parent = this.parseUtils.getDependencyLink(this.tree, node.id, dependency.type);

        // no parent means 'root'. TODO:(steven.kampen) Improve with NgModule context
        const parentIdx = !parent ? 0 : this.parentHierarchy.reduce((prev, curr, idx, p) =>
          prev >= 0 ? prev : p[idx].name === parent.name ? idx : prev, -1);

        x1 = START_X + NODE_INCREMENT_X * (depIndex + 1);
        y1 = START_Y + hierarchyIdx * NODE_INCREMENT_Y;
        x2 = START_X;
        y2 = START_Y + NODE_INCREMENT_Y * parentIdx;

        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-dependency dashed5');
      });
      this.addNodeAndText(nodeX, nodeY, node.name, 'fill-component stroke-component');
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
