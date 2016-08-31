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

  @Output() selectComponent: EventEmitter<any> = new EventEmitter<any>();

  private parentHierarchy;
  private parentHierarchyDisplay;
  private svg: any;

  constructor(
    private graphUtils: GraphUtils,
    private parseUtils: ParseUtils
  ) { }

  private onSelectComponent(component: any): void {
    this.selectComponent.emit(component);
  }

  ngOnChanges() {
    if (this.tree && this.selectedNode) {
      this.displayTree();
    }
  }

  private addRootDependencies() {
    const rootIndex = deserializePath(this.selectedNode.id).shift();

    const rootElement = this.tree.roots[rootIndex];
    if (rootElement == null) {
      return;
    }

    this.selectedNode.dependencies.forEach(
      dependency => {
        if (this.selectedNode.injectors.indexOf(dependency) < 0) {
          const parent = this.parseUtils.getDependencyLink
            (this.tree, this.selectedNode.id, dependency);
          if (!parent) {
            rootElement.injectors.push(dependency);
          }
        }
      });
  }

  private displayTree() {
    this.parentHierarchy =
      this.parseUtils.getParentHierarchy(this.tree, this.selectedNode);
    this.parentHierarchyDisplay =
      this.parentHierarchy.concat([this.selectedNode]);
    this.addRootDependencies();

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

  private addPosition(positions: any, posX: number, posY: number, node: any, injector?: any) {
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

  private addNodeAndText(posX: number, posY: number, title: any, positions: any, clazz: string) {
      this.graphUtils.addCircle(this.svg, posX, posY, NODE_RADIUS, clazz);
      this.graphUtils.addText(this.svg, posX - 6, posY - 15, title);
  }

  private render() {
    if (this.tree == null) {
      return;
    }

    let posX, posY, x1, y1, x2, y2;
    const positions = {};

    let i: number = 0;
    this.parentHierarchy.forEach((node) => {
      const nodeX = START_X;
      const nodeY = START_Y + NODE_INCREMENT_Y * i;

      this.addPosition(positions, nodeX, nodeY, node);

      let j: number = 0;
      node.injectors.forEach((injector) => {
        if (injector !== node.name) {
          const injectorX = nodeX + NODE_INCREMENT_X + NODE_INCREMENT_X * j;

          x1 = injectorX - NODE_INCREMENT_X + NODE_RADIUS;
          y1 = nodeY;
          x2 = injectorX - NODE_RADIUS;
          y2 = nodeY;
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-service');

          this.addNodeAndText(injectorX, nodeY, injector, positions, 'fill-service stroke-service');
          this.addPosition(positions, injectorX, nodeY, node, injector);

          j++;
        }
      });

      if (i > 0) {
        x1 = nodeX;
        y1 = START_Y + NODE_INCREMENT_Y * (i - 1) + NODE_RADIUS;
        x2 = nodeX;
        y2 = nodeY - (20 + NODE_RADIUS);
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'arrow stroke-component');
      }
      this.addNodeAndText(nodeX, nodeY, node.name, positions, 'fill-component stroke-component');

      i++;
    });

    let j: number = 0;
    this.selectedNode.injectors.forEach((injector) => {
      if (injector !== this.selectedNode.name) {
        posX = START_X + NODE_INCREMENT_X + NODE_INCREMENT_X * j;
        posY = START_Y + NODE_INCREMENT_Y * i;

        x1 = posX - NODE_INCREMENT_X + NODE_RADIUS;
        y1 = posY;
        x2 = posX - NODE_RADIUS;
        y2 = posY;
        this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-service');

        this.graphUtils.addCircle(this.svg, posX, posY, NODE_RADIUS, 'fill-service stroke-service');
        this.graphUtils.addText(this.svg, posX - 6, posY - 15, injector);

        j++;
      }
    });

    posX = START_X;
    posY = START_Y + NODE_INCREMENT_Y * i;
    this.addNodeAndText(posX, posY, this.selectedNode.name, positions, 'fill-root stroke-root');
    this.addPosition(positions, posX, posY, this.selectedNode);

    if (i > 0) {
      x1 = START_X;
      y1 = START_Y + NODE_INCREMENT_Y * (i - 1) + NODE_RADIUS;
      x2 = START_X;
      y2 = posY - 28;
      this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'arrow stroke-component');
    }

    this.selectedNode.dependencies.forEach((dependency) => {
      const parent = this.parseUtils.getDependencyLink
        (this.tree, this.selectedNode.id, dependency);
      if (parent) {
        const service = positions[parent.id].injectors[dependency];
        if (service) {
          x1 = positions[this.selectedNode.id].x + 5;
          y1 = positions[this.selectedNode.id].y - 10;
          // Convert vector between the two nodes to desirable polar coordinates
          const rho = Math.sqrt(((service.x - x1) ** 2) + ((y1 - service.y) ** 2)) - (NODE_RADIUS * 1.5);
          const theta = Math.atan2(service.y - y1, service.x - x1);
          // Convert back to euclidean coordinates
          x2 = x1 + rho * Math.cos(theta);
          y2 = y1 + rho * Math.sin(theta);
          this.graphUtils.addLine(this.svg, x1, y1, x2, y2, 'stroke-root arrow dashed5');
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
  }
}
