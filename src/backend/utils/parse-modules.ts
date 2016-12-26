import {classDecorators, componentMetadata} from '../../tree/decorators';
import {functionName} from '../../utils/function-name';

export const AUGURY_TOKEN_ID_METADATA_KEY = '__augury_token_id';

declare const ng;

const resolveNgModuleDecoratorConfig = (m) => {
  if (m.decorators) {
    return m.decorators.reduce((prev, curr, idx, decorators) =>
      prev ? prev : decorators[idx].type.prototype.toString() === '@NgModule' ? decorators[idx].args[0] : null, null);
  }

  return Reflect.getMetadata('annotations', m).find(decorator => decorator.toString() === '@NgModule');
};

export const parseModules = (firstRootDebugElement: any): {[key: string]: any} => {
  const bootstrappedModule = firstRootDebugElement.injector.get(ng.coreTokens.ApplicationRef)._injector.instance;
  const [modules, moduleNames] = _parseModule(bootstrappedModule.constructor);
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

const randomId = () => {
  return Math.random().toString(36).substring(7);
};

const resolveTokenIdMetaData = (token) => {
  if (!Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, token)) {
    Reflect.defineMetadata(AUGURY_TOKEN_ID_METADATA_KEY, randomId(), token);
  }
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

const addTokenIdMetaData = (providers: Array<any>) => {
  providers.forEach((provider) => {
    if (typeof provider === 'object') {
      if (provider.provide) {
        addTokenIdMetaData([provider.provide]);
      }
    } else if (Array.isArray(provider)) {
      provider.forEach(addTokenIdMetaData);
    } else {
      // make sure the token has an generated augury ID
      resolveTokenIdMetaData(provider);
    }
  });
};

const getProvidersFromDeclarations = (declarations: Array<any>) => {
  const providers: Array<any> = [];
  declarations.forEach((declaration) => {
    if (Array.isArray(declaration)) {
      Array.prototype.push.apply(providers, getProvidersFromDeclarations(declaration));
    } else {
      // get component decorator config
      const componentDecoratorConfig = componentMetadata(declaration);

      // read providers
      if (componentDecoratorConfig) {
        Array.prototype.push.apply(providers, componentDecoratorConfig.providers || []);
      }
    }
  });
  return providers;
};

const _parseModule = (module: any, modules: {} = {}, moduleNames: Array<string> = []) => {
  if (!modules[module]) {
    const ngModuleDecoratorConfig = resolveNgModuleDecoratorConfig(module);
    moduleNames.push(parseModuleName(module));
    modules[module] = buildModuleDescription(module, ngModuleDecoratorConfig);

    // collect all providers from this module
    const moduleProviders: Array<any> = (ngModuleDecoratorConfig.providers || [])
      .concat(getProvidersFromDeclarations(ngModuleDecoratorConfig.declarations || []));

    // add augury ids
    addTokenIdMetaData(moduleProviders);

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
