import {classDecorators, componentMetadata} from '../../tree/decorators';
import {functionName} from '../../utils/function-name';
import {Route} from '../utils/parse-router';

import {diagnosable} from '../../diagnostic-tools/backend/decorator';

export const AUGURY_TOKEN_ID_METADATA_KEY = '__augury_token_id';

declare const ng;

export interface NgModulesRegistry {
  modules: { [key: string]: any };
  configs: { [key: string]: any };
  names: Array<string>;
  tokenIdMap: { [key: string]: any };
}

const resolveNgModuleDecoratorConfig = (m) => {
  if (m.decorators) {
    return m.decorators.reduce((prev, curr, idx, decorators) =>
      prev ?
        prev :
        (
          (decorators[idx].type.prototype.ngMetadataName === 'NgModule') ||
          (decorators[idx].type.prototype.toString() === '@NgModule')
        ) ?
          (decorators[idx].args || [])[0] : null
    , null);
  }

  if (m.__annotations__) {
    return m.__annotations__
      .find(decorator => decorator.ngMetadataName === 'NgModule');
  }

  return (Reflect.getMetadata('annotations', m) || [])
    .find(decorator => decorator.toString() === '@NgModule');
};

export const parseModulesFromRouter = (router, existingModules: NgModulesRegistry) => {
  const foundModules = [];

  const _parse = (config) => {
    config.forEach(route => {
      if (route._loadedConfig) {
        foundModules.push(route._loadedConfig.module ?
          route._loadedConfig.module.instance :
          route._loadedConfig.injector.instance);
        _parse(route._loadedConfig.routes || []);
      }
      _parse(route.children || []);
    });
  };

  _parse(router.config);

  foundModules.forEach(module => {

    _parseModule(
      module.constructor,
      existingModules.modules,
      existingModules.names,
      existingModules.tokenIdMap);

    updateRegistryConfigs(existingModules);

  });
};


export const parseModulesFromRootElement = (firstRootDebugElement: any, registry: NgModulesRegistry) => {
  // TODO(steven.kampen): This uses a private API. Can it be improved?
  const bootstrappedModule = firstRootDebugElement.injector.get(ng.coreTokens.ApplicationRef)._injector.instance;

  if (bootstrappedModule) {
    _parseModule(
      bootstrappedModule.constructor,
      registry.modules,
      registry.names,
      registry.tokenIdMap);

    updateRegistryConfigs(registry);
  }

};

const updateRegistryConfigs = (registry: NgModulesRegistry) => {
  for (const m in registry.modules) {
    if (registry.modules.hasOwnProperty(m)) {
      registry.configs[registry.modules[m].name] = registry.modules[m];
    }
  }
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

const parseProviderName = p => {
  if (typeof p === 'object' && p.provide) {
    return p.provide.name || p.provide.toString().replace(' ', ':');
  }
  return p.name;
};

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

const _parseModule = diagnosable({
  pre: (s, remember) => (module, modules, moduleNames, tokenIdMap) => {
    s.assert('module passed as argument', !!module);
    remember({ module, modules });
  },
  post: (s, old) => ([ modules, moduleNames, tokenIdMap ]) => {
    // this is a recursive function because modules may contain other modules.
    s.assert(
      'moduleNames includes root module passed in as "module" param',
      moduleNames.includes( old('module').name )
    );
  },
})
(
  function _parseModule (
    module: any,
    modules: {} = {},
    moduleNames: Array<string> = [],
    tokenIdMap: {} = {}
  ) {

    const { 'augury_token_id' : auguryModuleId } = resolveTokenIdMetaData(module, tokenIdMap);

    if (!modules[auguryModuleId]) {
      const ngModuleDecoratorConfig = resolveNgModuleDecoratorConfig(module) || {};
      moduleNames.push(parseModuleName(module));
      modules[auguryModuleId] = buildModuleDescription(module, ngModuleDecoratorConfig);

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

      providersFromModuleImports.forEach(p => modules[auguryModuleId].providers.push(parseProviderName(p)));

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
  }
);
