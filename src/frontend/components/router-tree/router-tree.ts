import {Component, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';
import RouterInfo from './router-info';
import * as d3 from 'd3';

@Component({
  selector: 'bt-router-tree',
  templateUrl: '/src/frontend/components/router-tree/router-tree.html',
  styles: [`
    .node {
      cursor: pointer;
    }
    .node circle {
      fill: #fff;
      stroke: #CB5142;
    }
    .node text {
      font: 12px sans-serif;
    }
    .link {
      fill: none;
      stroke: #ccc;
      stroke-width: 1px;
    }
    bt-router-info {
      position: absolute;
      right: 20px;
      top: 50px;
      padding: 10px;
      border: solid 2px #CB5142;
      background-color: rgba(241, 155, 144, 0.7);
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
    console.log('routerTree', this.routerTree);
    // this.collapse(this.routerTree);
    this.render(this.routerTree);
  }

  render(source) {
    if (!source) {
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
      // .attr('transform', d => `translate(${source.y0}, ${source.x0})`)
      .on('mouseover', this.rollover.bind(this))
      .on('mouseout', this.rollover.bind(this));
      // .on('click', this.click.bind(this));

    nodeEnter.append('circle')
      .attr('r', 5)
      .attr('stroke-width', '1.5px')
      .style('fill', (d) =>
        this.selectedNode && (d.id === this.selectedNode.id) ? '#F19B90' : '#FFF'
      );

    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .style('fill-opacity', 1);

    // Update the nodes
    const nodeUpdate = node.transition()
      .duration(this.treeConfig.duration)
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .style('fill', (d) =>
        this.selectedNode && (d.id === this.selectedNode.id) ? '#F19B90' : '#FFF'
      );

    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Exit the nodes
    const nodeExit = node.exit().transition()
      .duration(this.treeConfig.duration)
      .attr('transform', (d) => `translate(${source.y}, ${source.x})`)
      .remove();

    nodeExit.select('circle')
        .attr('r', 1e-6);

    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d) => d.target.id);

    // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      // .attr('d', (d) => {
      //   let o = {x: source.x0, y: source.y0};
      //   return this.treeConfig.diagonal({source: o, target: o});
      // });

    // Transition links to their new position.
    link.transition()
      .duration(this.treeConfig.duration)
      .attr('d', this.treeConfig.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(this.treeConfig.duration)
      .attr('d', (d) => {
        let o = {x: source.x, y: source.y};
        return this.treeConfig.diagonal({source: o, target: o});
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

  }

  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
      d._children.forEach(this.collapse, this);
    }
  }

  rollover(d) {
    if (this.selectedNode) {
      this.selectedNode = null
    } else {
      this.selectedNode = d;
    }
    this.render(d);
  }

  click(d) {
    console.log('clicked: ', d);
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.render(d);
  }
}