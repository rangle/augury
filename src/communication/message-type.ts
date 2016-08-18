export enum MessageType {
  /// Response to a previous message
  Response,

  /// The frontend is requesting the initial set of application data (bootstrap)
  Bootstrap,

  /// Post a message to the browser event queue so that it can be unwrapped and posted to the extension
  DispatchWrapper,

  /// Begin the process of bootstrapping Augury
  Initialize,

  /// Angular framework has finished loading
  FrameworkLoaded,

  /// Transmit a complete component tree
  CompleteTree,

  /// Transmit the delta of two trees
  TreeDiff,
}