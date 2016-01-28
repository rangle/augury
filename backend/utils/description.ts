import { DebugElement_ as DebugElement }
       from 'angular2/src/core/debug/debug_element';

export interface Property {
  key: string;
  value: string;
}

export abstract class Description {

  public static getComponentDescription(compEl: DebugElement): Object[] {

    const componentInstance = compEl.componentInstance || {};
    const constructor =  componentInstance.constructor;
    const constructorName = constructor.name;
    const componentName = constructorName !== 'Object' ?
      constructorName : compEl.nativeElement.tagName;
    let description: Array<Property> = new Array<Property>();

    switch (componentName) {
      case 'RouterLink':
        description =  Description._getRouterLinkDesc(compEl);
        break;
      case 'RouterOutlet':
        description =  Description._getRouterOutletDesc(compEl);
        break;
      case 'NgSelectOption':
        description = Description._getSelectOptionDesc(compEl);
        break;
      case 'NgClass':
        description = Description._getClassDesc(compEl);
        break;
      case 'NgControlName':
        description = Description._getControlNameDesc(compEl);
        break;
      case 'NgModel':
        description = Description._getNgModelDesc(compEl);
        break;
      case 'NgForm':
        description = Description._getNgFormDesc(compEl);
        break;
      case 'NgSwitch':
        description = Description._getNgSwitchDesc(compEl);
        break;
      case 'NgSwitchWhen':
        description = Description._getNgSwitchWhenDesc(compEl);
        break;
      case 'NgSwitchDefault':
        description = Description._getNgSwitchWhenDesc(compEl);
        break;
      default:
        description = [
          { key: 'name', value: componentName },
        ];
        break;
    }
    return description;
  }

  private static _getRouterLinkDesc(compEl: DebugElement): Array<Property> {
    const element: HTMLElement = <HTMLElement>(compEl.nativeElement);
    const href: string = element.getAttribute('href');
    const htmlText: string = element.innerText;

    return [
      { key: 'href', value: href },
      { key: 'htmlText', value: htmlText }
    ];
  }

  private static _getSelectOptionDesc(compEl: DebugElement): Array<Property> {
    const elem = <HTMLElement>compEl.nativeElement;
    return [
      { key: 'label', value: elem.innerText },
      { key: 'value', value: elem.getAttribute('value') }
    ];
  }

  private static _getControlNameDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    return [
      { key: 'name', value: componentInstance.name },
      { key: 'value', value: componentInstance.value },
      { key: 'valid', value: componentInstance.valid }
    ];
  }

  private static _getNgFormDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    return [
      { key: 'status', value: componentInstance.form.status },
      { key: 'dirty', value: componentInstance.form.dirty }
    ];
  }

  private static _getRouterOutletDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    return [
      { key: 'name', value: componentInstance.name || ''},
      { key: 'hostComponent',
      value: componentInstance._componentRef.componentType.name },
    ];
  }

  private static _getNgSwitchDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    return [
      { key: 'useDefault', value: componentInstance._useDefault },
      { key: 'switchValue', value: componentInstance._switchValue },
      { key: 'valuesCount', value: componentInstance._valueViews.size }
    ];
  }

  private static _getNgSwitchWhenDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    console.log(componentInstance);
    return [
      { key: 'value', value: componentInstance._value }
    ];
  }

  private static _getClassDesc(compEl:DebugElement): Array<Property> {
    const rawClasses = compEl.componentInstance._rawClass;
    const appliedClasses = [];
    for (let key in rawClasses) {
      if (rawClasses[key]) {
        appliedClasses.push(key);
      }
    }
    console.log(appliedClasses);
    return [{
      key: 'applied',
      value: appliedClasses.map(String).join(',')
    }];
  }

  private static _getNgModelDesc(compEl: DebugElement): Array<Property> {
    const componentInstance = compEl.componentInstance;
    return [
      { key: 'model', value: componentInstance.name },
      { key: 'value', value: componentInstance.value },
      { key: 'viewModel', value: componentInstance.viewModel },
      { key: 'controlStatus', value: componentInstance._control.status },
      { key: 'dirty', value: componentInstance.dirty }
    ];
  }

}
