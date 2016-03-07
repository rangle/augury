import {Component, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';
import {UserActions} from '../../actions/user-actions/user-actions';
import RouterInfo from './router-info';
import * as d3 from 'd3';

@Component({
  selector: 'bt-router-tree',
  templateUrl:
    '/src/frontend/components/router-tree/router-tree.html',
  styles: [`
    .node {
      cursor: pointer;
    }
    .node circle {
      fill: #fff;
      stroke: #CB5142;
      stroke-width: 1.5px;
    }
    .node text {
      font: 12px sans-serif;
    }
    .link {
      fill: none;
      stroke: #ccc;
      stroke-width: 1px;
    }
  `],
  directives: [RouterInfo],
  encapsulation: ViewEncapsulation.None
})

export default class RouterTree implements OnChanges {
  @Input() routerTree: Array<any>;
  treeConfig: any;
  selectedNode: any;
  constructor(@Inject(ElementRef) elementRef: ElementRef) {

    const tree = d3.layout.tree();

    const diagonal = d3.svg.diagonal()
      .projection((d) => {
        return [d.y, d.x];
      });

    const svg = d3.select(elementRef.nativeElement)
      .append('svg')
      .attr('height', 1000)
      .attr('width', 1000)
      .append('g')
      .attr('transform', 'translate(100, 200)');

    this.treeConfig = {
      tree,
      diagonal,
      svg
    };

  }

  ngOnChanges() {
    console.log('routerTree', this.routerTree);
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
    tree.nodeSize([50, 5]);
    const nodes = tree.nodes(data).reverse();
    const links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 120;
    });

    // Declare the nodes
    const node = this.treeConfig.svg.selectAll('g.node')
      .data(nodes, (d) => {
        return d.id || (d.id = ++i);
      });

    // Enter the nodes
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.y + ',' + d.x + ')')
      .on('mouseover', (d) => {
        this.selectedNode = d;
        this.render();
      });

    nodeEnter.append('circle')
      .attr('r', 6)
      .style('fill', (d) =>
        this.selectedNode && (d.id === this.selectedNode.id) ? '#F19B90' : '#FFF'
      );

    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .style('fill-opacity', 1);

    // Update the nodes fill
    const nodeUpdate = node.transition()
      .select('circle')
      .style('fill', (d) =>
        this.selectedNode && (d.id === this.selectedNode.id) ? '#F19B90' : '#FFF'
      );

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d) => d.target.id);

    // Enter the links.
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', this.treeConfig.diagonal);
  }
}
