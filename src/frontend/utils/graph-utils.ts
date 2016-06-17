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

export const NODE_STROKE_COLORS = {
  0: '#9B9B9B',  // NODE_TYPES.ROOT
  1: '#2828AB', // NODE_TYPES.COMPONENT
  2: '#FF0202'  // NODE_TYPES.SERVICE,
};

export const NODE_COLORS = {
  0: '#9B9B9B',  // NODE_TYPES.ROOT
  1: '#EBF2FC', // NODE_TYPES.COMPONENT
  2: '#FFF0F0'  // NODE_TYPES.SERVICE,
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

  addText(svg: any, x: number, y: number, text: string, theme: string) {
    const fillColor: string = theme === 'dark' ? '#A5A5A5' : '#000000';
    svg
      .append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('fill', fillColor)
      .text(text);
  }

  addCircle(svg: any, x: number, y: number, r: number,
    fill: string, stroke: string) {
    svg
      .append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .style('fill', fill)
      .attr('r', r)
      .attr('stroke-width', 1)
      .attr('stroke', stroke);
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
