import {DebugElement} from '@angular/core';

export interface Property {
  key: string;
  value;
}

export abstract class Description {
  public static getProviderDescription(provider, instance): Property {
    const p = properties => ({ key: provider.name, value: properties });

    switch (provider.name) {
      case 'RouterOutlet':
        return p(Description._getRouterOutletDesc(instance));
      case 'RouterLink':
        return p(Description._getRouterLinkDesc(instance));
      case 'NgClass':
        return p(Description._getClassDesc(instance));
      case 'NgStyle':
        return p(Description._getNgClassDesc(instance));
      case 'NgFormModel':
        return p(Description._getNgFormModelDesc(instance));
      case 'NgFormControl':
        return p(Description._getFormControlDesc(instance));
      case 'NgControlStatus':
        return p(Description._getControlStatusDesc(instance));
      case 'NgModel':
        return p(Description._getNgModelDesc(instance));
      case 'NgForm':
        return p(Description._getNgFormDesc(instance));
    }
    return p([]);
  }

  public static getComponentDescription(debugElement: any): Array<Property> {
    if (debugElement == null) {
      return [];
    }

    const element: any = debugElement.nativeElement;

    const componentName = debugElement.componentInstance
      ? debugElement.componentInstance.constructor.name
      : element.tagName.toLowerCase();

    switch (componentName) {
      case 'a':
        return [
          { key: 'text', value: element.text },
          { key: 'url', value: element.hash }
        ];
      case 'NgSelectOption':
        return Description._getSelectOptionDesc(element);
      case 'NgIf':
        return Description._getNgIfDesc(debugElement.componentInstance);
      case 'NgControlName':
        return Description._getControlNameDesc
          (debugElement.componentInstance);
      case 'NgSwitch':
        return Description._getNgSwitchDesc(debugElement.componentInstance);
      case 'NgSwitchWhen':
        return Description._getNgSwitchWhenDesc
          (debugElement.componentInstance);
      case 'NgSwitchDefault':
        return Description._getNgSwitchWhenDesc
          (debugElement.componentInstance);
    }

    return [];
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
    // this is just a patch until we upgrade to work with new router
    if (instance._navigationInstruction) {
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
    } else {
      return [
        { key: 'href', value: instance.href },
        { key: 'isRouteActive', value: instance.isActive }
      ];
    }
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
        value: instance._currentInstruction &&
          instance._currentInstruction.componentType.name || ''
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
      { key: 'pristine', value: instance.form.pristine },
      { key: 'value', value: JSON.stringify(instance.value) }
    ];
  }

  private static _getNgIfDesc(instance: any): Array<Property> {
    return [
      { key: 'condition', value: instance._prevCondition }
    ];
  }
}
