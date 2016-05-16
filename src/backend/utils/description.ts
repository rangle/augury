export interface Property {
  key: string;
  value: string;
}

export abstract class Description {

  public static getComponentDescription(compEl: any): Object[] {
    let description: Array<Property> = new Array<Property>();
    if (!compEl) {
      return description;
    }

    const componentInstance: any = compEl.componentInstance || {};
    let componentName: string;
    if (compEl.componentInstance) {
      componentName = compEl.componentInstance.constructor.name;
    } else if (compEl.providerTokens && compEl.providerTokens.length > 0) {
      componentName = this.getFunctionName(compEl.providerTokens[0]);
    }

    const element: HTMLElement = <HTMLElement>compEl.nativeElement;

    switch (componentName) {
      case 'RouterLink':
        description =  Description._getRouterLinkDesc(element);
        break;
      case 'RouterOutlet':
        description =  Description._getRouterOutletDesc(compEl);
        break;
      case 'NgSelectOption':
        description = Description._getSelectOptionDesc(element);
        break;
      case 'NgIf':
        description = Description._getNgIfDesc(componentInstance);
        break;
      case 'NgClass':
        description = Description._getClassDesc(compEl);
        break;
      case 'NgControlName':
        description = Description._getControlNameDesc(componentInstance);
        break;
      case 'NgFormControl':
        description = Description._getFormControlDesc(componentInstance);
        break;
      case 'NgModel':
        description = Description._getNgModelDesc(componentInstance);
        break;
      case 'NgForm':
        description = Description._getNgFormDesc(compEl);
        break;
      case 'NgFormModel':
        description = Description._getNgFormModelDesc(compEl);
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

  private static _getNgFormDesc(compEl: any): Array<Property> {
    const instance = compEl.injector.get(compEl.providerTokens[0]);
    return [
      { key: 'status', value: instance.form.status },
      { key: 'dirty', value: instance.form.dirty }
    ];
  }

  private static _getRouterOutletDesc(compEl: any): Array<Property> {
    const properties = compEl.injector.get(compEl.providerTokens[0]);
    return [
      { key: 'name', value: properties.name || ''},
      { key: 'routeName',
        value: properties._currentInstruction &&
        properties._currentInstruction.routeName || ''
      },
      { key: 'hostComponent',
        value: properties._currentInstruction && this.getFunctionName
          (properties._currentInstruction.componentType) || ''
      }
    ];
  }

  private static _getNgSwitchDesc(instance: any): Array<Property> {
    return [
      { key: 'useDefault', value: instance._useDefault },
      { key: 'switchValue', value: instance._switchValue },
      {
        key: 'valuesCount', value:
          instance._valueViews ? instance._valueViews.size : 0 }
    ];
  }

  private static _getNgSwitchWhenDesc(instance: any): Array<Property> {
    return [
      { key: 'value', value: instance._value }
    ];
  }

  private static _getClassDesc(compEl: any): Array<Property> {
    const instance = compEl.injector.get(compEl.providerTokens[0]);
    const appliedClasses = [];
    for (let key in instance._rawClass) {
      if (instance._rawClass[key]) {
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

  private static _getNgFormModelDesc(compEl: any): Array<Property> {
    const instance = compEl.injector.get(compEl.providerTokens[0]);
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

  private static  getFunctionName(value: string) {
    let name = value.toString();
    name = name.substr('function '.length);
    name = name.substr(0, name.indexOf('('));
    return name;
  }
}
