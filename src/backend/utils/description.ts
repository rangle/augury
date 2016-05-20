export interface Property {
  key: string;
  value: string;
}

export abstract class Description {

  public static getProviderDescription(provider: any, instance: any): Object {
    let description = {};
    let properties = [];
    const providerName = this.getFunctionName(provider);
    switch (providerName) {
      case 'RouterOutlet':
        properties =  Description._getRouterOutletDesc(instance);
        break;
      case 'RouterLink':
        properties = Description._getRouterLinkDesc(instance);
        break;
      case 'NgClass':
        properties = Description._getClassDesc(instance);
        break;
      case 'NgStyle':
        properties = Description._getNgClassDesc(instance);
        break;
      case 'NgFormModel':
        properties = Description._getNgFormModelDesc(instance);
        break;
      case 'NgFormControl':
        properties = Description._getFormControlDesc(instance);
        break;
      case 'NgControlStatus':
        properties = Description._getControlStatusDesc(instance);
        break;
      case 'NgModel':
        properties = Description._getNgModelDesc(instance);
        break;
      case 'NgForm':
        properties = Description._getNgFormDesc(instance);
        break;


    }
    description = { key: providerName, value: properties };
    return description;
  }

  public static getComponentDescription(debugEl: any): Object[] {
    let description: Array<Property> = new Array<Property>();
    if (!debugEl || !debugEl.componentInstance) {
      return description;
    }
    const componentName = debugEl.componentInstance.constructor.name;
    const element: HTMLElement = <HTMLElement>debugEl.nativeElement;

    switch (componentName) {
      case 'NgSelectOption':
        description = Description._getSelectOptionDesc(element);
        break;
      case 'NgIf':
        description = Description._getNgIfDesc(debugEl.componentInstance);
        break;
      case 'NgControlName':
        description = Description._getControlNameDesc
          (debugEl.componentInstance);
        break;
      case 'NgSwitch':
        description = Description._getNgSwitchDesc(debugEl.componentInstance);
        break;
      case 'NgSwitchWhen':
        description = Description._getNgSwitchWhenDesc
          (debugEl.componentInstance);
        break;
      case 'NgSwitchDefault':
        description = Description._getNgSwitchWhenDesc
          (debugEl.componentInstance);
        break;
      default:
        description = [
          { key: 'name', value: componentName },
        ];
        break;
    }
    return description;
  }

  private static _getNgClassDesc(instance: any): Array<Property> {
    const styles = [];
    for (let key in instance._rawStyle) {
      if (instance._rawStyle[key]) {
        styles.push({
          key: key,
          value: instance._rawStyle[key]
        });
      }
    }
    return styles;
  }

  private static _getRouterLinkDesc(instance: any): Array<Property> {
    return [{
        key: 'routeName',
        value: instance._navigationInstruction.component.routeName
      },
      {
        key: 'componentType',
        value: instance._navigationInstruction.component.componentType.name
      },
      { key: 'visibleHref', value: instance.visibleHref },
      { key: 'isRouteActive', value: instance.isRouteActive },
      { key: 'routeParams', value: instance._routeParams }
    ];
  }

  private static _getSelectOptionDesc(element: HTMLElement): Array<Property> {
    return [
      { key: 'label', value: element.innerText },
      { key: 'value', value: element.getAttribute('value') }
    ];
  }

  private static _getControlStatusDesc(instance: any): Array<Property> {
    return [
      { key: 'ngClassDirty', value: instance.ngClassDirty },
      { key: 'ngClassPristine', value: instance.ngClassPristine },
      { key: 'ngClassValid', value: instance.ngClassValid },
      { key: 'ngClassInvalid', value: instance.ngClassInvalid },
      { key: 'ngClassTouched', value: instance.ngClassTouched },
      { key: 'ngClassUntouched', value: instance.ngClassUntouched }
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
      { key: 'dirty', value: instance.form.dirty },
      { key: 'value', value: JSON.stringify(instance.value) }
    ];
  }

  private static _getRouterOutletDesc(instance: any): Array<Property> {
    return [
      { key: 'name', value: instance.name || ''},
      { key: 'routeName',
        value: instance._currentInstruction &&
        instance._currentInstruction.routeName || ''
      },
      { key: 'hostComponent',
        value: instance._currentInstruction && this.getFunctionName
          (instance._currentInstruction.componentType) || ''
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

  private static _getClassDesc(instance: any): Array<Property> {
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
      { key: 'value', value: instance.value },
      { key: 'dirty', value: instance.dirty },
      { key: 'pristine', value: instance.pristine },
      { key: 'status', value: instance.control.status }
    ];
  }

  private static _getNgModelDesc(instance: any): Array<Property> {
    return [
      { key: 'model', value: instance.name },
      { key: 'value', value: instance.value },
      { key: 'viewModel', value: instance.viewModel },
      { key: 'controlStatus', value: instance.control.status },
      { key: 'dirty', value: instance.dirty },
      { key: 'pristine', value: instance.pristine },
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

  private static  getFunctionName(value: string) {
    let name = value.toString();
    name = name.substr('function '.length);
    name = name.substr(0, name.indexOf('('));
    return name;
  }
}
