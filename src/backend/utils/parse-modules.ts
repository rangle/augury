import {classDecorators} from '../../tree/decorators';
import {functionName} from '../../utils/function-name';
declare const ng;

const resolveNgModuleDecoratorConfig = (m) => {

  if (m.decorators) {
    return m.decorators.reduce((prev, curr, idx, decorators) =>
      prev ? prev : decorators[idx].type.prototype.toString() === '@NgModule' ? decorators[idx].args[0] : null, null);
  }

  return (Reflect.getOwnMetadata('annotations', m) || Reflect.getMetadata('annotations', m.constructor) || [])
    .reduce((prev, curr, idx, decorators) =>
      prev ? prev : decorators[idx].toString() === '@NgModule' ? decorators[idx] : null, null);
};

export const parseModules = (firstRootDebugElement: any): {[key: string]: any} => {
  const bootstrappedModule = firstRootDebugElement.injector.get(ng.coreTokens.ApplicationRef)._injector.instance;
  const [modules, moduleNames] = _parseModule(bootstrappedModule);
  const serializableModules = {};
  for (const m in modules) {
    if (modules.hasOwnProperty(m)) {
      serializableModules[modules[m].name] = modules[m];
    }
  }
  return {
    names: moduleNames,
    configs: serializableModules,
  };
};

const parseModuleName = (m) => {
  return m.ngModule ? m.ngModule.name : m.name || (m.constructor ? m.constructor.name : null);
};

const buildModuleDescription = (module, config) => {
  return {
    name: parseModuleName(module),
    imports: (config.imports || []).map(im => parseModuleName(im)),
    exports: (config.exports || []).map(ex => parseModuleName(ex)),
    declarations: (config.declarations || []).map(declaration => parseModuleName(declaration)),
    providers: (config.providers || []).map(provider => parseModuleName(provider)),
  };
};

const _parseModule = (module: any, modules: {} = {}, moduleNames: Array<string> = []) => {
  if (!modules[module]) {
    const ngModuleDecoratorConfig = resolveNgModuleDecoratorConfig(module);
    moduleNames.push(parseModuleName(module));
    modules[module] = buildModuleDescription(module, ngModuleDecoratorConfig);
    // parse modules imported by this module
    (ngModuleDecoratorConfig.imports || []).forEach((im: any): any => {
      const importedModule = im.ngModule || im;

      const importModuleDecorator = resolveNgModuleDecoratorConfig(importedModule);
      if (importModuleDecorator) {
        _parseModule(importedModule, modules, moduleNames);
      }
    });
  }

  return [modules, moduleNames];
};
