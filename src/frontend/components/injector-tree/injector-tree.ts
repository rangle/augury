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
  treeConfig: any;
  selectedNodeId: number;
  svg: any;

  componentIndex: number = 0;

  constructor(
    @Inject(ElementRef) elementRef: ElementRef
  ) {

     this.svg = d3.select(elementRef.nativeElement)
      .append('svg')
      .attr('height', 1000)
      .attr('width', 1000)
      .append('g')
      .attr('transform', 'translate(100, 200)');
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
    this.flattenedTree = tree; // this.flatten(tree);
    this.render();
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

  private renderInjector(injector: any) {
    this.svg.append('rect')
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("x", -25)
      .attr("y", -15)
      .attr("width", 50)
      .attr("height", 30)
      .style('fill', '#DDD');

    this.svg.append('text')
      .attr('x', -40)
      .attr('y', -40)
      .text(injector)
      .style('fill-opacity', 1);
  }

  private renderComponent(component: any, index: number) {

    console.log(component, index);

    this.svg.append('rect')
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("x", -50)
      .attr("y", -25 + 70 * this.componentIndex)
      .attr("width", 100 + (component.name.length - 13) * 6)
      .attr("height", 50)
      .style('fill', '#F19B90');

    this.svg.append('text')
      .attr('x', -43)
      .attr('y', -10 + 70 * this.componentIndex)
      .text(component.name)
      .style('fill-opacity', 1);

    if (component.injectors) {
      component.injectors.forEach((injector) => this.renderInjector(injector));
    }

    if (component.children) {
      component.children.forEach((comp, index) => this.renderComponent(comp, index));
    }
    this.componentIndex++;
  }

  private render() {
    if (!this.flattenedTree) {
      return;
    }

    const color = d3.scale.category20();
    const force = d3.layout.force()
      .charge(-120)
      .linkDistance(80)
      .size([1000, 1000]);

    const graph = {
      "nodes": [{
        "name": "Myriel",
        "group": 1
      }, {
          "name": "Napoleon",
          "group": 2
        }, {
          "name": "Mlle.Baptistine",
          "group": 3
        }, {
          "name": "Mme.Magloire",
          "group": 4
        }, {
          "name": "CountessdeLo",
          "group": 5
        }, {
          "name": "Geborand",
          "group": 6
        }, {
          "name": "Champtercier",
          "group": 7
        }, {
          "name": "Mme.Hucheloup",
          "group": 8
        }],
      "links": [{
        "source": 1,
        "target": 0,
        "value": 1
      }, {
          "source": 2,
          "target": 0,
          "value": 7
        }, {
          "source": 3,
          "target": 0,
          "value": 2
        }, {
          "source": 3,
          "target": 2,
          "value": 6
        }, {
          "source": 4,
          "target": 0,
          "value": 1
        }, {
          "source": 5,
          "target": 0,
          "value": 1
        }, {
          "source": 6,
          "target": 0,
          "value": 1
        }, {
          "source": 7,
          "target": 0,
          "value": 1
        }, {
          "source": 6,
          "target": 0,
          "value": 2
        }, {
          "source": 4,
          "target": 7,
          "value": 1
        }]
    };

    //Creates the graph data structure out of the json data
    force.nodes(graph.nodes)
      .links(graph.links)
      .start();

    //Create all the line svgs but without locations yet
    var link = this.svg.selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("marker-end", "url(#suit)") //Added
      ;

    //Do the same with the circles for the nodes - no
    var node = this.svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 8)
      .style("fill", function(d) {
        return color(d.group);
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

    //---Insert-------
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
