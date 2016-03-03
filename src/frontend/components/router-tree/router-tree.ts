import {Component, AfterViewInit, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';
import {UserActions} from '../../actions/user-actions/user-actions';
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
      stroke-width: 2px;
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
  encapsulation: ViewEncapsulation.None
})

export default class RouterTree implements OnChanges {
  @Input() routerTree: Array<any>;
  treeConfig: any;
  selectedNodeId: number;
  constructor(@Inject(ElementRef) elementRef: ElementRef) {

    const width = 700;
    const height = 650;
    const maxLabel = 150;
    const nodeRadius = 8;

    const tree = d3.layout.tree().size([height, width]);

    const diagonal = d3.svg.diagonal()
      .projection((d) => {
        return [d.y, d.x];
      });

    const svg = d3.select(elementRef.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + maxLabel + ',0)');

    this.treeConfig = {
      tree,
      diagonal,
      svg,
      nodeRadius
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
    const root = this.routerTree[0];
    let i = 0;

    // Compute the new tree layout.
    const nodes = tree.nodes(root).reverse();
    const links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * 180;
    });
	  console.log(nodes);

    // Declare the nodes
    const node = this.treeConfig.svg.selectAll('g.node')
      .data(nodes, (d) => {
        return d.id || (d.id = ++i);
      });
	  console.log('node', node);
    // Enter the nodes
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.y + ',' + d.x + ')')
      .on('click', (d) => {
        console.log('clicked node', d);
        this.selectedNodeId = d.id;
        this.render();
      });
	  console.log('nodeEnter', nodeEnter);
    nodeEnter.append('circle')
      .attr('r', this.treeConfig.nodeRadius)
      .style('fill', (d) => {
        console.log('fill ', d);
        return d.id === this.selectedNodeId ? 'red': '#fff'
      });

    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .style('fill-opacity', 1);

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d) => d.target.id);

    // Enter the links.
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', this.treeConfig.diagonal);
  }
}
