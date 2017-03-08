import {DebugElement} from '@angular/core';
import {AUGURY_TOKEN_ID_METADATA_KEY} from './parse-modules';
import {pathExists, getAtPath} from '../../utils/property-path';

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

/*
*  addPropsIfTheyExist([
*    ['text'], // result: { key: 'text', value: '<value>'}
*    ['text, 'text'], // result: { key: 'text', value: '<value>'}
*    ['some_label', 'text'], // result: { key: 'some_label', value: '<value>'}
*    ...
*  ]);
*/
const getPropsIfTheyExist = (object: any, props: Array<any[]>): Array<any> => {
  const properties: Array<any> = [];
  props.forEach((prop: any[]) => {
    const label = prop[0];
    const path = prop.length > 1 ? prop.slice(1, prop.length) : prop[0];

    if (pathExists(object, ...path)) {
      properties.push({key: label, value: getAtPath(object, ...path).value });
    }
  });
  return properties;
};
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

    const properties = [];

    switch (componentName) {
      case 'a':
        return getPropsIfTheyExist(element, [
          ['text'],
          ['hash'],
        ]);
      case 'router-outlet':
        const routerOutletProvider = debugElement.providerTokens.reduce((prev, curr) =>
          prev ? prev : curr.name === 'RouterOutlet' ? curr : null, null);
        return getPropsIfTheyExist(debugElement.injector.get(routerOutletProvider), [['name']]);
      case 'NgSelectOption':
        return (element) ? Description._getSelectOptionDesc(element) : [];
      case 'NgIf':
        return Description._getNgIfDesc(debugElement.componentInstance);
      case 'NgControlName':
        return Description._getControlNameDesc(debugElement.componentInstance);
      case 'NgSwitch':
        return Description._getNgSwitchDesc(debugElement.componentInstance);
      case 'NgSwitchWhen':
      case 'NgSwitchDefault':
        return Description._getNgSwitchWhenDesc(debugElement.componentInstance);
    }
    return properties;
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
      return getPropsIfTheyExist(instance, [
        ['routeName', '_navigationInstruction', 'component', 'routeName'],
        ['componentType', '_navigationInstruction', 'component', 'componentType', 'name'],
        ['visibleHref'],
        ['isRouteActive'],
        ['routeParams', '_routeParams'],
      ]);
    } else {
      return getPropsIfTheyExist(instance, [
        ['href'],
        ['isRouteActive', 'isActive'],
      ]);
    }
  }

  private static _getSelectOptionDesc(element: HTMLElement): Array<Property> {
    return getPropsIfTheyExist(element, [
      ['label', 'innerText'],
    ]).concat([{key: 'value', value: element.getAttribute('value')}]);
  }

  private static _getControlStatusDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['ngClassDirty'],
      ['ngClassPristine'],
      ['ngClassInvalid'],
      ['ngClassTouched'],
      ['ngClassUntouched'],
    ]);
  }

  private static _getControlNameDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['name'],
      ['value'],
      ['valid'],
    ]);
  }

  private static _getNgFormDesc(instance: any): Array<Property> {
    const properties = getPropsIfTheyExist(instance, [
      ['status', 'form', 'status'],
      ['dirty', 'form', 'dirty'],
    ]);

    return pathExists(instance, 'value')
      ? properties.concat([{key: 'value', value: JSON.stringify(instance.value)}])
      : properties;
  }

  private static _getRouterOutletDesc(instance: any): Array<Property> {
    const properties = getPropsIfTheyExist(instance, [
      ['name'],
      ['routeName', '_currentInstruction', 'routeName'],
      ['hostComponent', '_currentInstruction', 'componentType', 'name'],
    ]);
    properties
      .filter(element => element.key === 'routeName' || element.key === 'hostComponent')
      .forEach(element => element.value = element.value || '');

    return properties;
  }

  private static _getNgSwitchDesc(instance: any): Array<Property> {
    const properties = getPropsIfTheyExist(instance, [
      ['useDefault', '_useDefault'],
      ['switchDefault', '_switchValue'],
      ['valuesCount', '_valueViews'],
    ]);

    properties
      .filter(element => element.key === 'valuesCount')
      .forEach(element => element.value = element.value ? element.value.size : 0);

    return properties;
  }

  private static _getNgSwitchWhenDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['value', '_value'],
    ]);
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
    return getPropsIfTheyExist(instance, [
      ['value'],
      ['dirty'],
      ['pristine'],
      ['status', 'control', 'status'],
    ]);
  }

  private static _getNgModelDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['value'],
      ['viewModel'],
      ['dirty'],
      ['pristine'],
      ['status', 'control', 'status'],
    ]);
  }

  private static _getNgFormModelDesc(instance: any): Array<Property> {
    const properties = getPropsIfTheyExist(instance, [
      ['status', 'form', 'status'],
      ['dirty', 'form', 'dirty'],
      ['pristine', 'form', 'pristine'],
      ['status', 'control', 'status'],
    ]);
    return pathExists(instance, 'value')
      ? properties.concat([{key: 'value', value: JSON.stringify(instance.value)}])
      : properties;
  }

  private static _getNgIfDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['condition', '_prevCondition'],
    ]);
  }
}
