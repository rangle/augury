import {
  Component,
  Input,
  ViewChild,
  SimpleChanges,
  ElementRef
} from '@angular/core';

import {Route} from '../../../backend/utils';
import {UserActions} from '../../actions/user-actions/user-actions';

import * as d3 from 'd3';

@Component({
  selector: 'bt-router-tree',
  template: require('./router-tree.html'),
  styles: [require('to-string!./router-tree.css')],
})
export class RouterTree {
  @ViewChild('svgContainer') private svg: ElementRef;
  @ViewChild('mainGroup') private g: ElementRef;
  @Input() private routerTree: Array<Route>;
  private selectedRoute: Route | any;
  private tree: d3.TreeLayout<{}>;

  constructor(private userActions: UserActions, private element: ElementRef) {}

  render() {
    if (!this.routerTree) {
      return;
    }

    this.tree = d3.tree();

    const svg = d3.select(this.svg.nativeElement);
    const g = d3.select(this.g.nativeElement);

    const svgPadding = 20;

    // Compute the new tree layout.
    this.tree.nodeSize([20, 150]);

    const root: Route = {
      name: 'root',
      children: this.routerTree,
      hash: null,
      path: null,
      specificity: null,
      handler: null,
      data: {},
      isAux: false,
    };

    const nodes = this.tree(d3.hierarchy(
      root.children.length > 1 ? root : root.children[0], d => d.children));

    g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', d => `
            M${d.y},${d.x}
            C${(d.y + d.parent.y) / 2},
              ${d.x} ${(d.y + d.parent.y) / 2},
              ${d.parent.x} ${d.parent.y},
              ${d.parent.x}`);

    // Declare the nodes
    const node = g.selectAll('g.node')
      .data(nodes.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .on('mouseover', n => this.onRollover(n.data))
      .on('mouseout', n => this.onRollover(n.data))
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('class', d => (<any>d.data).isAux ? 'node-aux-route' : 'node-route')
      .attr('r', 6);

    node.append('text')
      .attr('x', (d) => d.children ? -13 : 13)
      .attr('dy', '.35em')
      .attr('text-anchor', (d) => d.children ? 'end' : 'start')
      .text(d => (<any>d.data).name)
      .attr('class', 'monospace');

    // reset transform
    g.attr('transform', 'translate(0, 0)');

    const svgRect = this.svg.nativeElement.getBoundingClientRect();
    const gElRect = this.g.nativeElement.getBoundingClientRect();

    g.attr('transform', `translate(
      ${svgRect.left - gElRect.left + svgPadding},
      ${svgRect.top - gElRect.top + svgPadding}
    )`);

    svg
      .attr('height', gElRect.height + svgPadding * 2)
      .attr('width', gElRect.width + svgPadding * 2);

  }

  private ngOnChanges(changes: SimpleChanges) {
    if ((<any>changes).routerTree && this.g) {
      d3.select(this.g.nativeElement).selectAll('*').remove();
    }
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
