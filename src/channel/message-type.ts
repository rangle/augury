export enum MessageType {
  /// Begin the process of bootstrapping Augury
  Initialize,

  /// Angular framework has finished loading
  FrameworkLoaded,

  /// Transmit a complete component tree
  CompleteTree,

  /// Transmit the delta of two trees
  TreeDiff,
}