import {Component, AfterViewInit, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input, EventEmitter}
  from 'angular2/core';

import * as d3 from 'd3';

import {ARROW_TYPES, NODE_TYPES, NODE_COLORS, ANGULAR_COMPONENTS, GraphUtils}
  from '../../utils/graph-utils';

import {ParseUtils} from '../../utils/parse-utils';

@Component({
  selector: 'bt-injector-tree',
  encapsulation: ViewEncapsulation.None,
  outputs: ['selectNode'],
  providers: [GraphUtils, ParseUtils],
  templateUrl:
    '/src/frontend/components/injector-tree/injector-tree.html',
  styles: [`
    .link {
      stroke: #000;
      stroke-width: 1.5px;
      z-index: -1;
      stroke-opacity: 0.7;
    }
    .circle-injector-tree {
      stroke: none;
    }
  `]
})
export default class InjectorTree implements OnChanges {

  @Input() tree: any;
  @Input() selectedNode: any;

  private parentHierarchy;
  private parentHierarchyDisplay;
  private selectNode: EventEmitter<any> = new EventEmitter<any>();
  private svg: any;
  private flattenedTree: any;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    private graphUtils: GraphUtils,
    private parseUtils: ParseUtils
  ) { }

  selectComponent(component: any): void {
    this.selectNode.emit(component);
  }

  ngOnChanges() {
    if (this.tree && this.selectedNode) {
      this.displayTree();
    }
  }

  private addRootDependencies() {
    this.selectedNode.dependencies.forEach((dependency) => {
      if (this.selectedNode.injectors.indexOf(dependency) === -1) {
        const parent = this.parseUtils.getDependencyLink
          (this.flattenedTree, this.selectedNode.id, dependency);
        if (!parent) {
          this.flattenedTree[0].injectors.push(dependency);
        }
      }
    });
  }

  private displayTree() {
    const tree = JSON.parse(JSON.stringify(this.tree));

    this.flattenedTree = this.parseUtils.flatten(tree);
    this.parentHierarchy =
      this.parseUtils.getParentHierarchy(this.flattenedTree, this.selectedNode);
    this.parentHierarchyDisplay =
      this.parentHierarchy.concat([this.selectedNode]);
    this.addRootDependencies();

    const graphContainer = this.elementRef.nativeElement
      .querySelector('#graphContainer');

    while (graphContainer.firstChild) {
      graphContainer.removeChild(graphContainer.firstChild);
    }

    this.svg = d3.select(graphContainer)
      .append('svg')
      .attr('height', this.parentHierarchy.length * 120 + 30)
      .attr('width', 600);

    this.render();
  }

  private addLegends() {
    this.graphUtils.addCircle(this.svg, 8, 12, 8, NODE_COLORS[0]);
    this.graphUtils.addCircle(this.svg, 8, 36, 8, NODE_COLORS[1]);

    this.graphUtils.addText(this.svg, 20, 16, 'Component');
    this.graphUtils.addText(this.svg, 20, 40, 'Service');
    this.graphUtils.addText(this.svg, 20, 64, 'Component to Component');
    this.graphUtils.addText(this.svg, 20, 88, 'Component to Service');
    this.graphUtils.addText(this.svg, 20, 112, 'Component to Dependency');

    this.graphUtils.addLine(this.svg, 0, 60, 16, 60, '');
    this.graphUtils.addLine(this.svg, 0, 84, 16, 84, 'stroke: #2CA02C;');
    this.graphUtils.addLine(this.svg, 0, 108, 16, 108,
      'stroke-dasharray:3px, 3px;');
  }

  private addPosition(positions: any, posX: number, posY: number,
    node: any, injector?: any) {
    if (injector) {
          positions[node.id].injectors[injector] = {
            'x': posX,
            'y': posY,
            'injector': injector
          };
    } else {
        positions[node.id] = {
          'x': posX,
          'y': posY,
          'node': node,
          'injectors': {}
        };
      }
  }

  private addNodeAndText(posX: number, posY: number,
    title: any, positions: any, color: string) {
      this.graphUtils.addCircle(this.svg, posX, posY, 8, color);
      this.graphUtils.addText(this.svg, posX - 6, posY - 15, title);
  }

  private render() {
    if (!this.flattenedTree) {
      return;
    }
    let posX, posY, x1, y1, x2, y2;
    const positions = {};

    const START_X: number = 20;
    const START_Y: number = 30;
    const NODE_INCREMENT_X: number = 100;
    const NODE_INCREMENT_Y: number = 100;

    let i: number = 0;
    this.parentHierarchy.forEach((node) => {
      posX = START_X;
      posY = START_Y + NODE_INCREMENT_Y * i;
      this.addNodeAndText(posX, posY, node.name, positions, NODE_COLORS[1]);
      this.addPosition(positions, posX, posY, node);

      if (i > 0) {
          x1 = START_X;
          y1 = START_Y + NODE_INCREMENT_Y * (i - 1) + 10;
          x2 = START_X;
          y2 = posY - 30;
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2,
            'marker-end: url(#suit);');
      }

      let j: number = 0;
      node.injectors.forEach((injector) => {
        if (injector !== node.name) {

          posX = START_X + NODE_INCREMENT_X + NODE_INCREMENT_X * j;
          posY = START_Y + NODE_INCREMENT_Y * i;
          this.addNodeAndText(posX, posY, injector, positions, NODE_COLORS[2]);
          this.addPosition(positions, posX, posY, node, injector);

          x1 = posX - NODE_INCREMENT_X + 10;
          y1 = posY;
          x2 = posX - 10;
          y2 = posY;
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2,
            'stroke: #CC0000;marker-end: url(#suit);');

          j++;
        }
      });
      i++;
    });

    posX = START_X;
    posY = START_Y + NODE_INCREMENT_Y * i;
    this.addNodeAndText(posX, posY, this.selectedNode.name,
      positions, NODE_COLORS[0]);
    this.addPosition(positions, posX, posY, this.selectedNode);

    x1 = START_X;
    y1 = START_Y + NODE_INCREMENT_Y * (i - 1) + 10;
    x2 = START_X;
    y2 = posY - 30;
    this.graphUtils.addLine(this.svg, x1, y1, x2, y2,
      'marker-end: url(#suit);');

    let j: number = 0;
    this.selectedNode.injectors.forEach((injector) => {
      if (injector !== this.selectedNode.name) {

        posX = START_X + NODE_INCREMENT_X + NODE_INCREMENT_X * j;
        posY = START_Y + NODE_INCREMENT_Y * i;
        this.graphUtils.addCircle(this.svg, posX, posY, 8, NODE_COLORS[2]);
        this.graphUtils.addText(this.svg, posX - 6, posY - 15, injector);

        x1 = posX - NODE_INCREMENT_X + 10;
        y1 = posY;
        x2 = posX - 10;
        y2 = posY;
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2,
          'stroke: #CC0000;marker-end: url(#suit);');

        j++;
      }
    });

    this.selectedNode.dependencies.forEach((dependency) => {
      const parent = this.parseUtils.getDependencyLink
        (this.flattenedTree, this.selectedNode.id, dependency);
      if (parent) {
        const service = positions[parent.id].injectors[dependency];
        if (service) {
          x1 = positions[this.selectedNode.id].x + 5;
          y1 = positions[this.selectedNode.id].y - 10;
          x2 = service.x - 10;
          y2 = service.y;
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2,
           'stroke-dasharray:3px, 3px;marker-end: url(#suit);');
        }
      }
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

    // this.addLegends();
  }
}
