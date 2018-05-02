export enum Tab {
  /// A tree representation of application components
  ComponentTree,

  /// A tree of router paths
  RouterTree,

  /// A list of loaded NgModules
  NgModules,

  /// Testing tools for debugging Augury
  DiagnosticTools
}

export enum StateTab {
  /// Properties panel
  Properties,

  /// Injector graph
  InjectorGraph
}
