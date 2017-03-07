import {DebugElement} from '@angular/core';
import {AUGURY_TOKEN_ID_METADATA_KEY} from './parse-modules';
import {pathExists} from '../../utils/property-path';

export interface Dependency {
  id: string;
  name: string;
  decorators: Array<string>;
}

export interface Property {
  id?: string;
  key: string;
  value;
}

export abstract class Description {
  public static getProviderDescription(provider, instance): Property {
    const p = properties => ({
      id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, provider),
      key: provider.name,
      value: properties,
    });

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
      default:
        return p([]);
    }
  }

  public static getComponentDescription(debugElement: any): Array<Property> {
    if (debugElement == null) {
      return [];
    }

    let componentName: any;
    const element: any = pathExists(debugElement, 'nativeElement') ? debugElement.nativeElement : null;

    if (debugElement.componentInstance) {
      componentName = pathExists(debugElement, 'componentInstance', 'constructor', 'name') ?
        debugElement.componentInstance.constructor.name : null;
    } else {
      componentName = pathExists(element, 'tagName') ?
        element.tagName.toLowerCase() : null;
    }

    switch (componentName) {
      case 'a':
        const properties = [];
        if (pathExists(element, 'text')) {
          properties.push({key: 'text', value: element.text});
        }
        if (pathExists(element, 'hash')) {
          properties.push({key: 'url', value: element.hash});
        }
        return properties;
      case 'NgSelectOption':
        return (element) ? Description._getSelectOptionDesc(element) : [];
      case 'NgIf':
        return Description._getNgIfDesc(debugElement.componentInstance);
      case 'NgControlName':
        return Description._getControlNameDesc(debugElement.componentInstance);
      case 'NgSwitch':
        return Description._getNgSwitchDesc(debugElement.componentInstance);
      case 'NgSwitchWhen':
        return Description._getNgSwitchWhenDesc(debugElement.componentInstance);
      case 'NgSwitchDefault':
        return Description._getNgSwitchWhenDesc(debugElement.componentInstance);
      default:
        return [];
    }
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
      const properties = [];

      if (pathExists(instance, '_navigationInstruction', 'component', 'routeName')) {
        properties.push({key: 'routeName', value: instance._navigationInstruction.component.routeName});
      }
      if (pathExists(instance, '_navigationInstruction', 'component', 'componentType', 'name')) {
        properties.push({key: 'componentType', value: instance._navigationInstruction.component.componentType.name});
      }
      if (pathExists(instance, 'visibleHref')) {
        properties.push({key: 'visibleHref', value: instance.visibleHref});
      }
      if (pathExists(instance, 'isRouteActive')) {
        properties.push({key: 'isRouteActive', value: instance.isRouteActive});
      }
      if (pathExists(instance, '_routeParams')) {
        properties.push({key: 'routeParams', value: instance._routeParams});
      }
      return properties;
    } else {
      const properties = [];

      if (pathExists(instance, 'href')) {
        properties.push({key: 'href', value: instance.href});
      }
      if (pathExists(instance, 'isActive')) {
        properties.push({key: 'isRouteActive', value: instance.isActive});
      }
      return properties;
    }
  }

  private static _getSelectOptionDesc(element: HTMLElement): Array<Property> {
    const properties = [];

    if (pathExists(element, 'innerText')) {
      properties.push({key: 'label', value: element.innerText});
    }
    properties.push({key: 'value', value: element.getAttribute('value')});

    return properties;
  }

  private static _getControlStatusDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'ngClassDirty')) {
      properties.push({key: 'ngClassDirty', value: instance.ngClassDirty});
    }
    if (pathExists(instance, 'ngClassPristine')) {
      properties.push({key: 'ngClassPristine', value: instance.ngClassPristine});
    }
    if (pathExists(instance, 'ngClassValid')) {
      properties.push({key: 'ngClassValid', value: instance.ngClassValid});
    }
    if (pathExists(instance, 'ngClassInvalid')) {
      properties.push({key: 'ngClassInvalid', value: instance.ngClassInvalid});
    }
    if (pathExists(instance, 'ngClassTouched')) {
      properties.push({key: 'ngClassTouched', value: instance.ngClassTouched});
    }
    if (pathExists(instance, 'ngClassUntouched')) {
      properties.push({key: 'ngClassUntouched', value: instance.ngClassUntouched});
    }

    return properties;
  }

  private static _getControlNameDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'name')) {
      properties.push({key: 'name', value: instance.name});
    }
    if (pathExists(instance, 'value')) {
      properties.push({key: 'value', value: instance.value});
    }
    if (pathExists(instance, 'valid')) {
      properties.push({key: 'valid', value: instance.valid});
    }

    return properties;
  }

  private static _getNgFormDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'form', 'status')) {
      properties.push({key: 'status', value: instance.form.status});
    }
    if (pathExists(instance, 'form', 'dirty')) {
      properties.push({key: 'dirty', value: instance.form.dirty});
    }
    if (pathExists(instance, 'value')) {
      properties.push({key: 'value', value: JSON.stringify(instance.value)});
    }

    return properties;
  }

  private static _getRouterOutletDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'name')) {
      properties.push({key: 'name', value: instance.name || ''});
    }
    if (pathExists(instance, '_currentInstruction', 'routeName')) {
      properties.push({key: 'routeName', value: instance._currentInstruction.routeName || ''});
    }
    if (pathExists(instance, '_currentInstruction', 'componentType', 'name')) {
      properties.push({key: 'hostComponent', value: instance._currentInstruction.componentType.name || ''});
    }

    return properties;
  }

  private static _getNgSwitchDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, '_useDefault')) {
      properties.push({key: 'useDefault', value: instance._useDefault});
    }
    if (pathExists(instance, '_switchValue')) {
      properties.push({key: 'switchDefault', value: instance._switchValue});
    }
    if (pathExists(instance, '_valueViews')) {
      properties.push({key: 'valuesCount', value: instance._valueViews ? instance._valueViews.size : 0});
    }

    return properties;
  }

  private static _getNgSwitchWhenDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, '_value')) {
      properties.push({key: 'value', value: instance._value});
    }

    return properties;
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
    const properties = [];

    if (pathExists(instance, 'value')) {
      properties.push({key: 'value', value: instance.value});
    }
    if (pathExists(instance, 'dirty')) {
      properties.push({key: 'dirty', value: instance.dirty});
    }
    if (pathExists(instance, 'pristine')) {
      properties.push({key: 'pristine', value: instance.pristine});
    }
    if (pathExists(instance, 'control', 'status')) {
      properties.push({key: 'status', value: instance.control.status});
    }

    return properties;
  }

  private static _getNgModelDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'value')) {
      properties.push({key: 'value', value: instance.value});
    }
    if (pathExists(instance, 'viewModel')) {
      properties.push({key: 'viewModel', value: instance.viewModel});
    }
    if (pathExists(instance, 'control', 'status')) {
      properties.push({key: 'controlStatus', value: instance.control.status});
    }
    if (pathExists(instance, 'dirty')) {
      properties.push({key: 'dirty', value: instance.dirty});
    }
    if (pathExists(instance, 'pristine')) {
      properties.push({key: 'pristine', value: instance.pristine});
    }

    return properties;
  }

  private static _getNgFormModelDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, 'form', 'status')) {
      properties.push({key: 'status', value: instance.form.status});
    }
    if (pathExists(instance, 'form', 'dirty')) {
      properties.push({key: 'dirty', value: instance.form.dirty});
    }
    if (pathExists(instance, 'form', 'pristine')) {
      properties.push({key: 'pristine', value: instance.form.pristine});
    }
    if (pathExists(instance, 'value')) {
      properties.push({key: 'value', value: JSON.stringify(instance.value)});
    }

    return properties;
  }

  private static _getNgIfDesc(instance: any): Array<Property> {
    const properties = [];

    if (pathExists(instance, '_prevCondition')) {
      properties.push({key: 'condition', value: instance._prevCondition});
    }

    return properties;
  }
}
