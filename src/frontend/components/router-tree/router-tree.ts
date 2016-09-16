import {
  Component,
  Input,
  ViewChild,
} from '@angular/core';

import {Route} from '../../../backend/utils';
import {UserActions} from '../../actions/user-actions/user-actions';

import * as d3 from 'd3';

interface TreeConfig {
  tree: d3.layout.Tree<d3.layout.tree.Node>;
  diagonal:
    d3.svg.Diagonal<
      d3.svg.diagonal.Link<d3.svg.diagonal.Node>,
      d3.svg.diagonal.Node
    >;
  svg: d3.Selection<any>;
}

@Component({
  selector: 'bt-router-tree',
  template: require('./router-tree.html'),
  styles: [require('to-string!./router-tree.css')],
})
export class RouterTree {
  @ViewChild('chartContainer') chartContainer;
  @Input() private routerTree: Array<Route>;
  private selectedRoute: Route | any;

  private treeConfig: TreeConfig;

  constructor(private userActions: UserActions) {}

  ngAfterViewInit() {
    this.treeConfig = this.getTree();
  }

  private getTree(): TreeConfig {
    const tree = d3.layout.tree();

    const diagonal = d3.svg.diagonal()
      .projection((d) => [d.y, d.x]);

    const svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('height', 500)
      .attr('width', 1000)
      .append('g')
      .attr('transform', 'translate(100, 200)');

    return {
      tree,
      diagonal,
      svg
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

    nodeEnter.append('text')
      .attr('x', (d) => d.children || d._children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children || d._children ? 'end' : 'start')
      .text((d) => d.name)
      .attr('class', 'monospace');

    // Update the nodes
     node.attr('transform', (d) => `translate(${d.y},${d.x})`);

    // Declare the links
    const link = this.treeConfig.svg.selectAll('path.link')
      .data(links, (d: any) => d.target.id);

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', this.treeConfig.diagonal);
  }

  private ngOnChanges() {
    this.render();
  }

  private onRollover(route) {
    if (this.selectedRoute) {
      this.selectedRoute = null;
    } else {
      this.selectedRoute = route;
    }
    this.render();
  }

  private onRetrieveSearchResults = (query: string): Promise<Array<any>> => {
    return this.userActions.searchRouter(this.routerTree, query);
  }

  private onSelectedSearchResultChanged(route: Route) {
    this.selectedRoute = route;
    this.render();
  }
}
