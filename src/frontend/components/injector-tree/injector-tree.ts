import {Component, AfterViewInit, ViewEncapsulation, OnChanges, Inject,
  ElementRef, Input} from 'angular2/core';

import * as d3 from 'd3';

@Component({
  selector: 'bt-injector-tree',
  encapsulation: ViewEncapsulation.None,
  templateUrl:
    '/src/frontend/components/injector-tree/injector-tree.html'
})
export default class InjectorTree implements OnChanges {

  @Input() tree: any;
  showTable: boolean = true;

  treeConfig: any;
  selectedNodeId: number;
  svg: any;

  nodes: any;
  injectors: any;
  componentIndex: number = 0;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef
  ) { }

  showTableClick(showTable: boolean) : void {
    this.showTable = showTable;
  }

  private flattenedTree: any;

  private ANGULAR_COMPONENTS = [
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
    this.filterChildren(tree);
    this.flattenedTree = this.flatten(tree);

    this.nodes = [];
    this.injectors = [];
    this.addNode(this.tree[0]);

    console.log(this.flattenedTree);

    const graphContainer = this.elementRef.nativeElement
      .querySelector('#graphContainer');

    while (graphContainer.firstChild) {
      graphContainer.removeChild(graphContainer.firstChild);
    }

    this.svg = d3.select(graphContainer)
      .append('svg')
      .attr('height', 500)
      .attr('width', 500)
      .append('g')
      .attr('transform', 'translate(100, 200)');

    this.render();
  }

  private addNode(node: any) {
    this.nodes.push({
      name: node.name,
      isComponent: true
    });

    if(node.injectors && node.injectors.length > 0) {
      node.injectors.forEach((injector) => {
        this.injectors.push({
          name: injector,
          isComponent: false
        });
      });
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((node) => this.addNode(node));
    }
  }

  private filterChildren(components: any) {
    components
      .filter((component) => component.children && component.children.length > 0)
      .map((component) => {
        component.children = component
          .children
          .filter((comp) => {
            const exists = this.ANGULAR_COMPONENTS.indexOf(comp.name) === -1;
            if (exists && comp.children) {
              this.filterChildren(comp.children);
            }
            return exists;
          });
        return component;
    });
  }

  private render() {
    if (!this.flattenedTree) {
      return;
    }

    const color = d3.scale.category20();
    const force = d3.layout.force()
      .charge(-120)
      .linkDistance(80)
      .size([500, 500]);

    const graph = {
      nodes: this.nodes.concat(this.injectors),
      links: []
    };

    console.log(graph);

    // const graph = {
    //   "nodes": [{
    //     "name": "Myriel",
    //     "group": 1
    //   }, {
    //       "name": "Napoleon",
    //       "group": 2
    //     }, {
    //       "name": "Mlle.Baptistine",
    //       "group": 3
    //     }, {
    //       "name": "Mme.Magloire",
    //       "group": 4
    //     }, {
    //       "name": "CountessdeLo",
    //       "group": 5
    //     }, {
    //       "name": "Geborand",
    //       "group": 6
    //     }, {
    //       "name": "Champtercier",
    //       "group": 7
    //     }, {
    //       "name": "Mme.Hucheloup",
    //       "group": 8
    //     }],
    //   "links": [{
    //     "source": 1,
    //     "target": 0,
    //     "value": 1
    //   }, {
    //       "source": 2,
    //       "target": 0,
    //       "value": 7
    //     }, {
    //       "source": 3,
    //       "target": 0,
    //       "value": 2
    //     }, {
    //       "source": 3,
    //       "target": 2,
    //       "value": 6
    //     }, {
    //       "source": 4,
    //       "target": 0,
    //       "value": 1
    //     }, {
    //       "source": 5,
    //       "target": 0,
    //       "value": 1
    //     }, {
    //       "source": 6,
    //       "target": 0,
    //       "value": 1
    //     }, {
    //       "source": 7,
    //       "target": 0,
    //       "value": 1
    //     }, {
    //       "source": 6,
    //       "target": 0,
    //       "value": 2
    //     }, {
    //       "source": 4,
    //       "target": 7,
    //       "value": 1
    //     }]
    // };

    force.nodes(graph.nodes)
      .links(graph.links)
      .start();

    var link = this.svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("marker-end", "url(#suit)");

    var node = this.svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 8)
      .style("fill", function(d) {
        if (d.isComponent) {
          return color('1');
        }
        return color('2');
      })
      .call(force.drag);

    var text = this.svg.append("svg:g")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("svg:g");

    text.append("svg:text")
      .attr("x", 8)
      .attr("y", ".31em")
      .attr("class", "shadow")
      .text(function(d) { return d.name; });

    force.on("tick", function() {
      link.attr("x1", function(d) {
        return d.source.x;
      })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node.attr("cx", function(d) {
        return d.x;
      })
        .attr("cy", function(d) {
          return d.y;
        });

      text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });

    this.svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
      .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
      .style("stroke", "#4679BD")
      .style("opacity", "0.6");
  }

}
