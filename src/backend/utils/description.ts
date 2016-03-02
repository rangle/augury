// import { DebugElement_ as DebugElement }
//        from 'angular2/src/core/debug/debug_element';

export interface Property {
  key: string;
  value: string;
}

export abstract class Description {

  public static getComponentDescription(compEl: any): Object[] {

    const componentInstance: any = compEl.componentInstance || {};
    const constructor: any =  componentInstance.constructor;
    const constructorName: string = constructor.name;
    const componentName: string = constructorName !== 'Object' ?
      constructorName : compEl.nativeElement.tagName;
    const element: HTMLElement = <HTMLElement>compEl.nativeElement;

    let description: Array<Property> = new Array<Property>();

    switch (componentName) {
      case 'RouterLink':
        description =  Description._getRouterLinkDesc(element);
        break;
      case 'RouterOutlet':
        description =  Description._getRouterOutletDesc(componentInstance);
        break;
      case 'NgSelectOption':
        description = Description._getSelectOptionDesc(element);
        break;
      case 'NgIf':
        description = Description._getNgIfDesc(componentInstance);
        break;
      case 'NgClass':
        description = Description._getClassDesc(componentInstance);
        break;
      case 'NgControlName':
        description = Description._getControlNameDesc(componentInstance);
        break;
      case 'NgFormControl':
        description = Description._getFormControlDesc(componentInstance);
        break;
      case 'ControlForm':
        description = Description._getFormControlDesc(componentInstance);
        break;
      case 'NgModel':
        description = Description._getNgModelDesc(componentInstance);
        break;
      case 'NgForm':
        description = Description._getNgFormDesc(componentInstance);
        break;
      case 'NgFormModel':
        description = Description._getNgFormModelDesc(componentInstance);
        break;
      case 'NgSwitch':
        description = Description._getNgSwitchDesc(componentInstance);
        break;
      case 'NgSwitchWhen':
        description = Description._getNgSwitchWhenDesc(componentInstance);
        break;
      case 'NgSwitchDefault':
        description = Description._getNgSwitchWhenDesc(componentInstance);
        break;
      default:
        description = [
          { key: 'name', value: componentName },
        ];
        break;
    }
    return description;
  }

  private static _getRouterLinkDesc(element: HTMLElement): Array<Property> {
    return [
      { key: 'href', value: element.getAttribute('href') },
      { key: 'htmlText', value: element.innerText }
    ];
  }

  private static _getSelectOptionDesc(element: HTMLElement): Array<Property> {
    return [
      { key: 'label', value: element.innerText },
      { key: 'value', value: element.getAttribute('value') }
    ];
  }

  private static _getControlNameDesc(instance: any): Array<Property> {
    return [
      { key: 'name', value: instance.name },
      { key: 'value', value: instance.value },
      { key: 'valid', value: instance.valid }
    ];
  }

  private static _getNgFormDesc(instance: any): Array<Property> {
    return [
      { key: 'status', value: instance.form.status },
      { key: 'dirty', value: instance.form.dirty }
    ];
  }

  private static _getRouterOutletDesc(instance: any): Array<Property> {
    return [
      { key: 'name', value: instance.name || ''},
      { key: 'hostComponent',
        value: instance._componentRef
           && instance._componentRef.componentType
           && instance._componentRef.componentType.name }
    ];
  }

  private static _getNgSwitchDesc(instance: any): Array<Property> {
    return [
      { key: 'useDefault', value: instance._useDefault },
      { key: 'switchValue', value: instance._switchValue },
      { key: 'valuesCount', value: instance._valueViews.size }
    ];
  }

  private static _getNgSwitchWhenDesc(instance: any): Array<Property> {
    return [
      { key: 'value', value: instance._value }
    ];
  }

  private static _getClassDesc(instance: any): Array<Property> {
    const rawClasses = instance._rawClass;
    const appliedClasses = [];
    for (let key in rawClasses) {
      if (rawClasses[key]) {
        appliedClasses.push(key);
      }
    }
    return [{
      key: 'applied',
      value: appliedClasses.map(String).join(',')
    }];
  }

  private static _getFormControlDesc(instance: any): Array<Property> {
    return [
      { key: 'model', value: instance.name },
      { key: 'value', value: instance.value },
      { key: 'viewModel', value: instance.viewModel },
      { key: 'dirty', value: instance.dirty }
    ];
  }

  private static _getNgModelDesc(instance: any): Array<Property> {
    return [
      { key: 'model', value: instance.name },
      { key: 'value', value: instance.value },
      { key: 'viewModel', value: instance.viewModel },
      { key: 'controlStatus', value: instance.control.status },
      { key: 'dirty', value: instance.dirty }
    ];
  }

  private static _getNgFormModelDesc(instance: any): Array<Property> {
    return [
      { key: 'status', value: instance.form.status },
      { key: 'dirty', value: instance.form.dirty },
      { key: 'value', value: JSON.stringify(instance.value) }
    ];
  }

  private static _getNgIfDesc(instance: any): Array<Property> {
    return [
      { key: 'condition', value: instance._prevCondition }
    ];
  }
}
