export enum MessageType {
  // Begin the process of loading the extension
  Initialize,

  /// Angular framework has finished loading
  FrameworkLoaded,

  /// Check to see if the other side (frontend or backend) is open and responsive
  Ping,

  NotNgApp,

  /// Response to a previous message
  Response,

  /// An error has occurred in the backend and is being transmitted to the frontend
  ApplicationError,

  /// An error has been cleared, and frontend should resume normal functioning
  /// this is used in the case of pages without angular suddenly bootstrapping, for example
  ErrorCleared,

  /// User signals "report this error".
  SendUncaughtError,

  /// Post a message to the browser event queue so that it can be unwrapped and
  /// posted to the extension from the content-script. There is no pipe that is
  /// direct from the backend to the frontend, so this allows us to bounce the
  /// message through {@link window.postMessage} so that the content script can
  /// receive it and send it through the multi-hop port.
  DispatchWrapper,

  /// This is an unusual message -- it contains no data itself, it just tells the
  /// frontend that there are messages waiting for it that it can read direct from
  /// the message queue instead of passing the messages through the four-hop pipe
  /// of backend -> content script -> channel -> frontend.
  Push,

  /// Send the inspected application ng version
  NgVersion,

  /// Transmit a complete component tree
  CompleteTree,

  /// Transmit the delta of two trees
  TreeDiff,

  /// This message type complements the TreeDiff type.
  /// In the case where a component instance property has been changed,
  ///   the treediff operation will not find a delta, since component instance properties
  ///   are not kept in the tree.
  /// This message is sent out after all tree comparisons that produce an empty delta.
  /// If there is a component selected for inspection in the front end,
  ///   this message serves to notify that its properties might have updated,
  ///   and a reselect should be requested to get up-to-date values.
  TreeUnchanged,

  /// Send the list of NgModules
  NgModules,

  /// Send the complete router tree (TODO(cbond: support diff))
  RouterTree,

  /// Select a component in the tree view
  SelectComponent,

  /// Update the value of a property inside the component tree
  UpdateProperty,

  /// Update a property on a provider reference
  UpdateProviderProperty,

  /// Emit a new value through an EventEmitter
  EmitValue,

  GoogleTagManagerSend,

  /// these have to be put here because there's no way to merge enums..
  ///   (should be declared in 'diagnostic-tools' module directory)
  /// Diagnostic info collected on the backend gets sent to the front end for display
  DiagnosticPacket,
  DiagnosticEvent,
  /// Options related to Diagnostic updated on frontend, backend should read again
  DiagnosticOptionsUpdated,

  /** --- feature modules --- **/

  /* highlighter */

  /// Set the nodes that should be highlighted on the page
  Highlight,

  /// Find a corresponding mutable tree node based on a DOM node
  FindElement,

  /* node-inspect */
  NI_InspectNode, // frontend
  NI_GetPropsAtPath, // frontend
  NI_PropsAtPath, // backend
  NI_ShallowProps, // backend
  NI_SubscribeToObservable, // frontend
  NI_SubscribedToObservable, // backend
  NI_ObservableEmission, // backend // TODO: should be ObservableValue ???

  /* change-detection-profiler */
  CDP_Tick, // backend
  CDP_MetricsPerSecond, // backend
  CDP_Pause, // frontend
  CDP_Unpause, // fronend
  CDP_QueuedTask, // backend
  CDP_DequeuedTask, // backend

}
