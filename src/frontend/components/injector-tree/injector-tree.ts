import {Component, AfterViewInit, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';

import * as d3 from 'd3';

enum ARROW_TYPES {
  COMPONENT,
  INJECTOR,
  DEPENDENCY
};

enum NODE_TYPES {
  COMPONENT,
  SERVICE
};

const NODE_COLORS = {
  0: '#1f77b4', // NODE_TYPES.COMPONENT
  1: '#ff7f0e'  // NODE_TYPES.SERVICE
};

const ANGULAR_COMPONENTS = [
  'NgClass',
  'RouterLink',
  'RouterOutlet',
  'LoadIntoComponent',
  'LoadNextToComponent',
  'LoadAsRootComponent',
  'NgForm',
  'NgModel',
  'NgControlName'
];

@Component({
  selector: 'bt-injector-tree',
  encapsulation: ViewEncapsulation.None,
  templateUrl:
    '/src/frontend/components/injector-tree/injector-tree.html',
  styles: [`
    .link {
      stroke: #000;
      stroke-opacity: .8;
      stroke-width: 1px;
    }
  `]
})
export default class InjectorTree implements OnChanges {

  @Input() tree: any;
  showTable: boolean = true;

  svg: any;
  nodes: any;
  links: any;
  flattenedTree: any;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  showTableClick(showTable: boolean) : void {
    this.showTable = showTable;
  }

  ngOnChanges() {
    if (this.tree) {
      this.displayTree();
    }
  }

  private flatten(list: Array<any>) {
    return list.reduce((a, b) => {
      return a.concat(Array.isArray(b.children) ?
        [this.copyParent(b), ...this.flatten(b.children)] : b);
    }, []);
  }

  private copyParent(p: Object) {
    return Object.assign({}, p, { children: undefined });
  }

  private displayTree() {
    const tree = JSON.parse(JSON.stringify(this.tree));
    // this.filterChildren(tree);

    this.flattenedTree = this.flatten(tree);

    this.nodes = [];
    this.links = [];
    this.addNode(tree[0]);

    const graphContainer = this.elementRef.nativeElement
      .querySelector('#graphContainer');

    while (graphContainer.firstChild) {
      graphContainer.removeChild(graphContainer.firstChild);
    }

    this.svg = d3.select(graphContainer)
      .append('svg')
      .attr('height', 1000)
      .attr('width', 1000);

    this.render();
  }

  private addLink(source: any, target: any, type: ARROW_TYPES) {
    this.links.push({
      'source': source.index,
      'target': target.index,
      'value': 5,
      'type': type
    });
  }

  private getDependencyLink(nodeId: string, dependency: string) {
    let searchId, searchedNodes, node;

    for (let i: number = nodeId.length - 2; i > -1; i = i - 2) {
       searchId =  nodeId.substr(0, i);
       searchedNodes = this.flattenedTree.filter((n) => n.id === searchId);

       if (searchedNodes.length > 0 &&
           searchedNodes[0].injectors.indexOf(dependency) > -1) {
         node = searchedNodes[0];
         break;
       }
    }
    return node;
  }

  private addNode(node: any, parent?: any) {

    const obj = {
      node: node,
      name: node.name,
      type: NODE_TYPES.COMPONENT,
      index: this.nodes.length
    };
    this.nodes.push(obj);

    if (parent) {
      this.addLink(parent, obj, ARROW_TYPES.COMPONENT);
    }

    if (node.injectors && node.injectors.length > 0) {
      node.injectors.forEach((injector) => {
        const inj = {
          node: node,
          name: injector,
          type: NODE_TYPES.SERVICE,
          index: this.nodes.length
        };
        this.nodes.push(inj);
        this.addLink(obj, inj, ARROW_TYPES.INJECTOR);
      });
    }

    if (node.dependencies && node.dependencies.length > 0) {
      node.dependencies.forEach((dependency) => {

        if (node.injectors.indexOf(dependency) === -1) {
          const linkedNode = this.getDependencyLink(node.id, dependency);
          if (linkedNode) {
            const filteredNodes = this.nodes.filter((n) =>
              n.name === dependency && n.node.id === linkedNode.id);
            if (filteredNodes.length > 0) {
              this.addLink(obj, filteredNodes[0], ARROW_TYPES.DEPENDENCY);
            }
          }
        }
      });
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode) => this.addNode(childNode, obj));
    }
  }

  private filterChildren(components: any) {
    components
      .filter((component) => component.children &&
        component.children.length > 0)
      .map((component) => {
        component.children = component
          .children
          .filter((comp) => {
            const exists = ANGULAR_COMPONENTS.indexOf(comp.name) === -1;
            if (exists && comp.children) {
              this.filterChildren(comp.children);
            }
            return exists;
          });
        return component;
    });
  }

  private addText(x: number, y: number, text: string) {
    this.svg
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .text(text);
  }

  private addCircle(x: number, y: number, r: number, fill: string) {
    this.svg
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .style('fill', fill)
        .attr('r', r);
  }

  private addLine(x1: number, y1: number,
    x2: number, y2: number, style: string) {
    this.svg
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('class', 'link')
      .attr('style', style);
  }

  private addLegends() {

    this.addCircle(8, 12, 8, NODE_COLORS[0]);
    this.addCircle(8, 36, 8, NODE_COLORS[1]);

    this.addText(20, 16, 'Component');
    this.addText(20, 40, 'Service');
    this.addText(20, 64, 'Component to Component');
    this.addText(20, 88, 'Component to Service');
    this.addText(20, 112, 'Component to Dependency');

    this.addLine(0, 60, 16, 60, '');
    this.addLine(0, 84, 16, 84, 'stroke: #2CA02C;');
    this.addLine(0, 108, 16, 108, 'stroke-dasharray:3px, 3px;');
  }

  private render() {
    if (!this.flattenedTree) {
      return;
    }

    this.addLegends();

    const force = d3.layout.force()
      .charge(-500)
      .linkDistance(100)
      .size([1000, 1000]);

    const graph = {
      nodes: this.nodes,
      links: this.links
    };

    console.log(graph);

    force.nodes(graph.nodes)
      .links(graph.links)
      .start();

    const link = this.svg.selectAll('.link')
      .data(graph.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('style', (d) => {
        let style = 'marker-end: url(#suit);';
        if (d.type === ARROW_TYPES.INJECTOR) {
          style = style + 'stroke: #2CA02C;';
        } else if (d.type === ARROW_TYPES.DEPENDENCY) {
          style = style + 'stroke-dasharray:3px, 3px;';
        }
        return style;
      });

    const node = this.svg.selectAll('.node')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('r', 8)
      .style('fill', (d) => {
        return NODE_COLORS[d.type];
      })
      .call(force.drag);

    const text = this.svg.append('svg:g')
      .selectAll('g')
      .data(graph.nodes)
      .enter().append('svg:g');

    text.append('svg:text')
      .attr('x', 8)
      .attr('y', '.31em')
      .attr('class', 'shadow')
      .text((d) => d.name);

    force.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      text.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    });

    this.svg.append('defs').selectAll('marker')
      .data(['suit', 'licensing', 'resolved'])
      .enter().append('marker')
      .attr('id', (d) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5 L10,0 L0, -5')
      .style('stroke', '#4679BD')
      .style('opacity', '0.6');
  }

}
