import {AUGURY_TOKEN_ID_METADATA_KEY} from './parse-modules';
import {pathExists, getAtPath} from '../../utils/property-path';
import {functionName} from '../../utils';

//@todo: code-sharing. "x-frontend" stuff is actually isomorphic, works in backend
import { componentInstanceExistsInParentChain, isDebugElementComponent } from './description-frontend'

export { isDebugElementComponent }

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

export const getComponentName = (element): string => {
  if (element.componentInstance &&
    element.componentInstance.constructor &&
    !componentInstanceExistsInParentChain(element)) {
    return functionName(element.componentInstance.constructor);
  }
  else if (element.name) {
    return element.name;
  }

  return element.nativeElement.tagName.toLowerCase();
};


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
    return {
      id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, provider),
      key: provider.name,
      value: null,
    };
  }

  public static getComponentDescription(debugElement: any): Array<Property> {
    if (debugElement == null) {
      return [];
    }

    let componentName: any;
    const element: any = pathExists(debugElement, 'nativeElement') ? debugElement.nativeElement : null;

    if (debugElement.componentInstance && !componentInstanceExistsInParentChain(debugElement)) {
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
      case 'form':
          return getPropsIfTheyExist(element, [
            ['method']
          ]);
      case 'input':
        return getPropsIfTheyExist(element, [
          ['id'],
          ['name'],
          ['type'],
          ['required']
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

  private static _getSelectOptionDesc(element: HTMLElement): Array<Property> {
    return getPropsIfTheyExist(element, [
      ['label', 'innerText'],
    ]).concat([{key: 'value', value: element.getAttribute('value')}]);
  }

  private static _getControlNameDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['name'],
      ['value'],
      ['valid'],
    ]);
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

  private static _getNgIfDesc(instance: any): Array<Property> {
    return getPropsIfTheyExist(instance, [
      ['condition', '_prevCondition'],
    ]);
  }
}
