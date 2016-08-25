import {
  Component,
  ViewEncapsulation,
  Inject,
  ElementRef,
  Input,
} from '@angular/core';

import RouterInfo from '../router-info/router-info';
import {Route} from '../../../backend/utils';

import * as d3 from 'd3';

interface TreeConfig {
  tree: d3.layout.Tree<d3.layout.tree.Node>;
  diagonal:
    d3.svg.Diagonal<
      d3.svg.diagonal.Link<d3.svg.diagonal.Node>,
      d3.svg.diagonal.Node
    >;
  svg: d3.Selection<any>;
  duration: number;
}

@Component({
  selector: 'bt-router-tree',
  template: require('./router-tree.html'),
  styles: [require('to-string!./router-tree.css')],
  directives: [RouterInfo]
})
export class RouterTree {
  @Input() routerTree: Array<Route>;
  @Input() routerException: string;
  @Input() theme: string;

  private treeConfig: TreeConfig;

  private selectedNode;

  constructor(@Inject(ElementRef) elementRef: ElementRef) {
    this.treeConfig = this.getTree(elementRef);
  }

  private getTree(elementRef: ElementRef): TreeConfig {
    const tree = d3.layout.tree();

    const diagonal = d3.svg.diagonal()
      .projection((d) => [d.y, d.x]);

    const svg = d3.select(elementRef.nativeElement)
      .append('svg')
      .attr('height', 500)
      .attr('width', 1000)
      .append('g')
      .attr('transform', 'translate(100, 200)');

    return {
      tree,
      diagonal,
      svg,
      duration: 500
    };
  }

  render() {
    if (!this.routerTree) {
      return;
    }

    const tree = this.treeConfig.tree;
    const data = this.routerTree;
    let i = 0;

    // Compute the new tree layout.
    tree.nodeSize([20, 10]);

    let nodes = [];
    for (const root of data) {
      nodes = nodes.concat(tree.nodes(root));
    }
    nodes.reverse();

    const links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 150;
    });

    // Declare the nodes
    const node = this.treeConfig.svg.selectAll('g.node')
      .data(nodes, (d: any) => d.id || (d.id = ++i));

    // Enter the nodes
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .on('mouseover', n => this.onRollover(n))
      .on('mouseout', n => this.onRollover(n));

    nodeEnter.append('circle')
      .attr('class', (d) => d.isAux ? 'node-aux-route' : 'node-route')
      .attr('r', 6);

    const fillColor: string = this.theme === 'dark' ? '#A5A5A5' : '#000000';
    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .attr('fill', fillColor)
      .style('fill-opacity', 1);

    // Update the nodes
    const nodeUpdate = node.transition()
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .style('fill', (d) => {
        if (this.selectedNode && (d.id === this.selectedNode.id)) {
          return d.isAux ? '#2828AB' : '#F05057';
        }
        return d.isAux ? '#EBF2FC' : '#FFF0F0';
      });

    nodeUpdate.select('text')
      .attr('fill', fillColor)
      .attr('class', 'monospace')
      .style('fill-opacity', 1);

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d: any) => d.target.id);

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attr('style', 'stroke: #9B9B9B; stroke-width: 1px; fill: none;')
      .attr('class', 'link');

    // Transition links to their new position.
    link.transition()
      .duration(this.treeConfig.duration)
      .attr('d', this.treeConfig.diagonal);

  }

  private ngOnChanges() {
    this.render();
  }

  private onRollover(node) {
    if (this.selectedNode) {
      this.selectedNode = null;
    } else {
      this.selectedNode = node;
    }
    this.render();
  }
}
