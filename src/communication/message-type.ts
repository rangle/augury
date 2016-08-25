export enum MessageType {
  // Begin the process of loading the extension
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

  /// Send the complete router tree (TODO(cbond: support diff))
  RouterTree,

  /// Select a component in the tree view
  SelectComponent,

  /// Update the value of a property inside the component tree
  UpdateProperty,

  /// Emit a new value through an EventEmitter
  EmitValue,

  /// Set the nodes that should be highlighted on the page
  Highlight,
}
