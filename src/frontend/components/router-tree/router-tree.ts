import {Component, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';
import RouterInfo from '../router-info/router-info';
import * as d3 from 'd3';

@Component({
  selector: 'bt-router-tree',
  templateUrl: '/src/frontend/components/router-tree/router-tree.html',
  host: { 'class': 'col col-12' },
  directives: [RouterInfo]
})

export class RouterTree {

  @Input() routerTree: Array<any>;
  treeConfig: any;
  selectedNode: any;

  constructor(@Inject(ElementRef) elementRef: ElementRef) {

    const tree = d3.layout.tree();

    const diagonal = d3.svg.diagonal()
      .projection((d) => [d.y, d.x]);

    const svg = d3.select(elementRef.nativeElement)
      .append('svg')
      .attr('height', 500)
      .attr('width', 1000)
      .append('g')
      .attr('transform', 'translate(100, 200)');

    this.treeConfig = {
      tree,
      diagonal,
      svg,
      duration: 500
    };

  }

  ngOnChanges() {
    this.render();
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
    const nodes = tree.nodes(data).reverse();
    const links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 150;
    });

    // Declare the nodes
    const node = this.treeConfig.svg.selectAll('g.node')
      .data(nodes, (d) => d.id || (d.id = ++i));

    // Enter the nodes
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .on('mouseover', this.rollover.bind(this))
      .on('mouseout', this.rollover.bind(this));

    nodeEnter.append('circle')
      .attr('class', (d) => d.isAux ? 'node-aux-route' : 'node-route')
      .attr('r', 6);

    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .style('fill-opacity', 1);

    // Update the nodes
    const nodeUpdate = node.transition()
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .style('fill', (d) => {
        if (this.selectedNode && (d.id === this.selectedNode.id)) {
          return d.isAux ? '#2828AB' : '#FF0202';
        }
        return d.isAux ? '#EBF2FC' : '#FFF0F0';
      });

    nodeUpdate.select('text')
      .attr('class', 'monospace')
      .style('fill-opacity', 1);

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d) => d.target.id);

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attr('style', 'stroke: #9B9B9B; stroke-width: 1px;')
      .attr('class', 'link');

    // Transition links to their new position.
    link.transition()
      .duration(this.treeConfig.duration)
      .attr('d', this.treeConfig.diagonal);

  }

  rollover(d) {
    if (this.selectedNode) {
      this.selectedNode = null;
    } else {
      this.selectedNode = d;
    }
    this.render();
  }

}
