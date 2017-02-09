import {classDecorators, componentMetadata} from '../../tree/decorators';
import {functionName} from '../../utils/function-name';

export const AUGURY_TOKEN_ID_METADATA_KEY = '__augury_token_id';

declare const ng;

const resolveNgModuleDecoratorConfig = (m) => {
  if (m.decorators) {
    return m.decorators.reduce((prev, curr, idx, decorators) =>
      prev ? prev : decorators[idx].type.prototype.toString() === '@NgModule' ?
        (decorators[idx].args || [])[0] : null, null);
  }

  return Reflect.getMetadata('annotations', m).find(decorator => decorator.toString() === '@NgModule');
};

export const parseModules = (firstRootDebugElement: any): {[key: string]: any} => {
  // TODO(steven.kampen): This uses a private API. Can it be improved?
  const bootstrappedModule = firstRootDebugElement.injector.get(ng.coreTokens.ApplicationRef)._injector.instance;
  const [modules, moduleNames, tokenIdMap] = _parseModule(bootstrappedModule.constructor);
  const serializableModules = {};
  for (const m in modules) {
    if (modules.hasOwnProperty(m)) {
      serializableModules[modules[m].name] = modules[m];
    }
  }
  return {
    names: moduleNames,
    configs: serializableModules,
    tokenIdMap,
  };
};

const parseModuleName = (m) => {
  return m.ngModule ? m.ngModule.name : m.name || (m.constructor ? m.constructor.name : null);
};

const randomId = () => {
  return Math.random().toString(36).substring(7);
};

const resolveTokenIdMetaData = (token, tokenIdMap: { [key: string]: any }) => {
  let tokenId = null;
  if (typeof token === 'string') {
    tokenId = token;
  } else {
    if (!Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, token)) {
      tokenId = randomId();
      while (tokenIdMap[tokenId]) {
        tokenId = randomId();
      }
      Reflect.defineMetadata(AUGURY_TOKEN_ID_METADATA_KEY, tokenId, token);
    }
  }
  return { token: token, augury_token_id: tokenId || Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, token) };
};

const parseProviderName = p =>
  typeof p === 'object' && p.provide ? p.provide.name || p.provide.toString().replace(' ', ':') : p.name;

const buildModuleDescription = (module, config) => {
  const flattenedDeclarations = flatten(config.declarations || []);
  const flattenedProvidersFromDeclarations = flattenedDeclarations.reduce((prev, curr, i, declarations) => {
    const componentDecoratorConfig = componentMetadata(declarations[i]);
    return componentDecoratorConfig ? prev.concat(flatten(componentDecoratorConfig.providers || [])) : prev;
  }, []);

  return {
    name: parseModuleName(module),
    imports: flatten(config.imports || []).map(im => parseModuleName(im)),
    exports: flatten(config.exports || []).map(ex => parseModuleName(ex)),
    declarations: flattenedDeclarations.map(d => d.name),
    providers: flatten((config.providers || [])).map(parseProviderName),
    providersInDeclarations: flattenedProvidersFromDeclarations.map(parseProviderName),
  };
};

const flattenProviders = (providers: Array<any> = []) => {
  const flatArray: Array<any> = [];
  providers.forEach(item => {
    if (Array.isArray(item)) {
      Array.prototype.push.apply(flatArray, flattenProviders(item));
    } else if (typeof item === 'object') {
      if (Array.isArray(item.provide)) {
        Array.prototype.push.apply(flatArray, flattenProviders(item.provide || []));
      } else {
        flatArray.push(item.provide);
      }
    } else {
      flatArray.push(item);
    }
  });
  return flatArray;
};

const flatten = (l: Array<any>) => {
  const flatArray: Array<any> = [];
  l.forEach(item => {
    if (Array.isArray(item)) {
      Array.prototype.push.apply(flatArray, flatten(item));
    } else {
      flatArray.push(item);
    }
  });
  return flatArray;
};

const _parseModule = (module: any, modules: {} = {},
  moduleNames: Array<string> = [], tokenIdMap: { [key: string]: any } = {}) => {

  if (!modules[module]) {
    const ngModuleDecoratorConfig = resolveNgModuleDecoratorConfig(module);
    moduleNames.push(parseModuleName(module));
    modules[module] = buildModuleDescription(module, ngModuleDecoratorConfig);

    // collect all providers from this module
    const moduleComponents = flatten(ngModuleDecoratorConfig.declarations || [])
      .filter(declaration => componentMetadata(declaration));

    const moduleComponentProviders = moduleComponents.reduce((prev, curr, i, components) =>
      prev.concat(flattenProviders(componentMetadata(components[i]).providers || [])), []);

    const providersFromModuleImports = [];

    // parse modules imported by this module
    const flatImports = flatten(ngModuleDecoratorConfig.imports || []);
    flatImports.forEach((im: any): any => {
      const importedModule = im.ngModule || im;

      if (im.ngModule) {
        Array.prototype.push.apply(providersFromModuleImports, flattenProviders(im.providers));
      }

      const importModuleDecorator = resolveNgModuleDecoratorConfig(importedModule);
      if (importModuleDecorator) {
        _parseModule(importedModule, modules, moduleNames, tokenIdMap);
      }
    });

    providersFromModuleImports.forEach(p => modules[module].providers.push(parseProviderName(p)));

    // add augury ids
    flattenProviders(ngModuleDecoratorConfig.providers || [])
      .concat(providersFromModuleImports)
      .concat(moduleComponentProviders)
      .concat(moduleComponents)
      .map(t => resolveTokenIdMetaData(t, tokenIdMap))
      .map(tokenAndId => {
        const isString = (typeof tokenAndId.token) === 'string';
        tokenIdMap[tokenAndId.augury_token_id] = {
          name: !isString ? tokenAndId.token.name : tokenAndId.token,
          type: !isString && componentMetadata(tokenAndId.token) ? 'Component' : 'Injectable',
          module: module.name,
        };
      });
  }

  return [modules, moduleNames, tokenIdMap];
};
