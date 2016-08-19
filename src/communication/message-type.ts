export enum MessageType {
  // Bootstrap
  Initialize,

  /// Response to a previous message
  Response,

  /// Post a message to the browser event queue so that it can be unwrapped and posted to the extension
  DispatchWrapper,

  /// Angular framework has finished loading
  FrameworkLoaded,

  /// Transmit a complete component tree
  CompleteTree,

  /// Transmit the delta of two trees
  TreeDiff,
}