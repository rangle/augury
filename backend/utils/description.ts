import { DebugElement_ as DebugElement }
       from 'angular2/src/core/debug/debug_element';

export abstract class Description {

  private static getKeyValue(key: string, value: string): string {
    return `<p class="node-item-property">${key}="</p>
    <p class="node-item-value">${value}"</p>`;
  }

  public static getComponentDescription
  (compEl: DebugElement, componentName: string): string {
    if (componentName === 'RouterLink') {
      componentName = `<p class="node-item-name">${componentName}</p>`;

      let element: HTMLElement = <HTMLElement>(compEl.nativeElement);
      let href = this.getKeyValue('href', element.getAttribute('href'));
      let htmlText = this.getKeyValue('text', element.innerText);
      componentName = componentName + ' (' + htmlText + ', ' + href + ')';
    }
    return componentName;
  }
}
