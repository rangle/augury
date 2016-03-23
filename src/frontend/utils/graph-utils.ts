export enum ARROW_TYPES {
  COMPONENT,
  INJECTOR,
  DEPENDENCY
};

export enum NODE_TYPES {
  ROOT,
  COMPONENT,
  SERVICE
};

export const NODE_COLORS = {
  0: '#000000',  // NODE_TYPES.ROOT
  1: '#1f77b4', // NODE_TYPES.COMPONENT
  2: '#ff7f0e'  // NODE_TYPES.SERVICE,
};

export const ANGULAR_COMPONENTS = [
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

export class GraphUtils {

  addText(svg: any, x: number, y: number, text: string) {
    svg
      .append('text')
      .attr('x', x)
      .attr('y', y)
      .text(text);
  }

  addCircle(svg: any, x: number, y: number, r: number, fill: string) {
    svg
      .append('circle')
      .attr('class', 'circle-injector-tree')
      .attr('cx', x)
      .attr('cy', y)
      .style('fill', fill)
      .attr('r', r);
  }

  addLine(svg: any, x1: number, y1: number,
    x2: number, y2: number, style: string) {
    svg
      .append('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .attr('class', 'link')
      .attr('style', style);
  }
}
