// NOTE: (ericjim) delete this file and of it's imports once we no longer support the deprecated router.

export function IS_OLD_ROUTER(router) : boolean {

  // `config` key is different for both routers, it's highly unlikely that the deprecated router will change this.
  const componentRouterConfigIsArray: boolean = Array.isArray(router.config);
  const deprecatedRouterConfigIsFunction: boolean = typeof router.config === "function";
  const oldConfig = deprecatedRouterConfigIsFunction && !componentRouterConfigIsArray;

  // root of the app is stored in a different key.
  const deprecatedRootComponentKey: boolean = router.hasOwnProperty('root');
  const componentRouterRootComponentKey: boolean = router.hasOwnProperty('rootComponentType');
  const oldRoot = deprecatedRootComponentKey && !componentRouterRootComponentKey;

  return oldRoot && oldConfig;
}