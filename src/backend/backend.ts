import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {compare} from '../utils/patch';
import {isAngular, isDebugMode} from './utils/app-check';

import {SerializeableError} from '../utils/error-handling';

import {
  MutableTree,
  Node,
  Path,
  instanceWithMetadata,
  serializePath,
} from '../tree';

import {onElementFound, onFindElement} from './utils/find-element';

import {
  parseModulesFromRootElement,
  parseModulesFromRouter,
  NgModulesRegistry,
} from './utils/parse-modules';

import {
  parseNgVersion,
} from './utils/parse-ng-version';

import {createTreeFromElements} from '../tree/mutable-tree-factory';

import {
  ApplicationError,
  ApplicationErrorType,
  Message,
  MessageFactory,
  MessageType,
  browserDispatch,
  browserSubscribe,
} from '../communication';

import {
  parameterTypes,
} from '../tree/decorators';

import {send} from './indirect-connection';

import {
  Route,
  highlight,
  clear as clearHighlights,
  parseRoutes,
  getNodeFromPartialPath,
  getNodeInstanceParent,
  getNodeProvider,
} from './utils';

import {serialize} from '../utils';
import {MessageQueue} from '../structures';
import {SimpleOptions} from '../options';

import { MessagePipeBackend } from 'feature-modules/.lib';
import { highlighter } from 'feature-modules/highlighter/backend/index';

declare const ng;
declare const getAllAngularRootElements: () => Element[];
declare const treeRenderOptions: SimpleOptions;

/// For tree deltas that contain more changes than {@link deltaThreshold},
/// we simply send the entire tree again instead of trying to patch it
/// since it will be faster than trying to apply hundreds or thousands of
/// changes to an existing tree.
const deltaThreshold = 512;

/// For large messages, we do not send them through the normal pipe (which
/// is backend > content script > backround channel > frontend), we add them
/// to this buffer and then send a {@link MessageType.Push} message that
/// tells the frontend to read messages directly from this queue itself.
/// This allows us to prevent very large messages containing tree data from
/// being serialized and deserialized four times. Using this mechanism, they
/// are serialized and deserialized a total of one times.
const messageBuffer = new MessageQueue<Message<any>>();

/// NOTE(cbond): We collect roots from all applications (mulit-app support)
let previousTree: MutableTree,
  previousRoutes: Array<Route>,
  previousCount: number,
  onMouseOver,
  onMouseDown,
  lastTreeMessage;

const parsedModulesData: NgModulesRegistry = {
  modules: {},
  names: [],
  configs: {},
  tokenIdMap: {},
};

const featureModulesPipe = new MessagePipeBackend({
  messageQueue: messageBuffer,
  sendMessage: send,
  createQueueAlertMessage: () => MessageFactory.push()
});

const onUpdateNotifier = new Subject<void>();

highlighter.useComponentTreeInstance(previousTree);
highlighter.useDocumentInstance(document);
highlighter.useOnUpdateNotifier(onUpdateNotifier.asObservable());
highlighter.useMessagePipe(featureModulesPipe);

const runAndHandleUncaughtExceptions = (fn: () => any) => {
  try {
    return fn();
  } catch (e) {
    send(MessageFactory.uncaughtApplicationError({
      name: e.name,
      stack: e.stack,
      message: e.message,
    }));
  }
};

const sendNgVersionMessage = () => {
  const ngVersion = parseNgVersion();
  send(MessageFactory.ngVersion(ngVersion));
};

const sendNgModulesMessage = () => {
  const ngModulesMessage = {
    names: parsedModulesData.names,
    tokenIdMap: parsedModulesData.tokenIdMap,
    configs: parsedModulesData.configs,
  };
  messageBuffer.enqueue(MessageFactory.ngModules(ngModulesMessage));
  send(MessageFactory.push());
};

const parseInitialModules = (): Promise<void> => {
  return Promise.resolve().then(() => {
    runAndHandleUncaughtExceptions(() => {
      const roots = getAllAngularRootElements().map(r => ng.probe(r));
      if (roots.length) {
        parseModulesFromRootElement(roots[0], parsedModulesData);
        sendNgModulesMessage();
      }
    });
  });
};

const updateComponentTree = (roots: Array<any>): Promise<void> => {
  return Promise.resolve().then(() => {

    const {tree, count} = createTreeFromElements(roots, treeRenderOptions);

    if (previousTree == null || Math.abs(previousCount - count) > deltaThreshold) {
      messageBuffer.enqueue(MessageFactory.completeTree(tree));
    }
    else {
      const changes = previousTree.diff(tree);
      if (changes.length > 0) {
        lastTreeMessage = 'diff';
        messageBuffer.enqueue(MessageFactory.treeDiff(changes));
      }
      else {
        if (lastTreeMessage === 'no-diff') { return; }
        lastTreeMessage = 'no-diff';
        messageBuffer.enqueue(MessageFactory.treeUnchanged());
      }
    }

    /// Send a message through the normal channels to indicate to the frontend
    /// that messages are waiting for it in {@link messageBuffer}
    send(MessageFactory.push());

    previousTree = tree;
    highlighter.useComponentTreeInstance(previousTree);

    previousCount = count;

  });
};

const updateLazyLoadedNgModules = (routers): Promise<void> => {
  return Promise.resolve().then(() => {

    routers.forEach(router => {
      parseModulesFromRouter(router, parsedModulesData);
    });

    sendNgModulesMessage();

  });
};

const updateRouterTree = (): Promise<void> => {
  return Promise.resolve().then(() => {

    const routers: Array<any> = routerTree();
    const parsedRoutes = routers.map(parseRoutes);

    let routesChanged = !previousRoutes ? true : false;

    if (previousRoutes) {
      const changes = compare(previousRoutes, parsedRoutes);
      if (changes.length > 0) {
        routesChanged = true;
      }
    }

    previousRoutes = parsedRoutes;

    if (routesChanged) {
      updateLazyLoadedNgModules(routers);
      messageBuffer.enqueue(MessageFactory.routerTree(parsedRoutes));
    }

  });
};

const subject = new Subject<void>();

const subscriptions = new Array<Subscription>();

const bind = (root) => {
  const ngZone = root.injector.get(ng.coreTokens.NgZone);
  if (ngZone) {
    subscriptions.push(ngZone.onStable.subscribe(() => subject.next(void 0)));
  }

  // parse components and routes each time
  subscriptions.push(
    subject.debounceTime(0).subscribe(() => {
      Promise.all([
        updateComponentTree(getAllAngularRootElements().map(r => ng.probe(r))),
        updateRouterTree()
      ]).then(() => onUpdateNotifier.next());
    }));

  // initial load
  subject.next(void 0);
};

const resubscribe = () => {
  runAndHandleUncaughtExceptions(() => {
    sendNgVersionMessage();

    messageBuffer.clear();

    for (const subscription of subscriptions) {
      subscription.unsubscribe();
    }

    subscriptions.splice(0, subscriptions.length);

    getAllAngularRootElements().forEach(root => bind(ng.probe(root)));

    setTimeout(() => runAndHandleUncaughtExceptions(() => parseInitialModules().then(() => onUpdateNotifier.next())));

    previousRoutes = null;
    setTimeout(() => runAndHandleUncaughtExceptions(() => updateRouterTree().then(() => onUpdateNotifier.next())));
  });
};

// Check to see if the Augury tab is open and active before we start
// subscribing to Angular state changes. Our internal state management
// can cause a slight drag on performance which is unnecessary if
// the Augury UI / frontend is not even open.
send(MessageFactory.ping()).then(resubscribe);

const selectedComponentPropertyKey = '$$el';

const noSelectedComponentWarningText = 'There is no component selected.';

Object.defineProperty(window, selectedComponentPropertyKey,
  {value: noSelectedComponentWarningText});

const messageHandler = (message: Message<any>) => {

  featureModulesPipe.handleIncomingMessage(message);

  return runAndHandleUncaughtExceptions(() => {
    switch (message.messageType) {
      case MessageType.Initialize:
        // Update our tree settings closure
        Object.assign(treeRenderOptions, message.content);

        // Clear out existing tree representation and start over
        previousTree = null;

        // Load the complete component tree
        if (!isAngular()) {
          send(MessageFactory.notNgApp());
        } else if (!isDebugMode()) {
          send(MessageFactory.applicationError(
            new ApplicationError(ApplicationErrorType.ProductionMode)));
        }
        else {
          resubscribe();
        }

        return true;

      case MessageType.SelectComponent:
        const path: Path = message.content.path;

        if (previousTree) {
          const node = previousTree.traverse(path);
          this.consoleReference(node);

          // For component selection events, we respond with component instance
          // properties for the selected node. If we had to serialize the
          // properties of each node on the tree that would be a performance
          // killer, so we only send the componentInstance values for the
          // node that has been selected.
          return getComponentInstance(previousTree, node);
        }
        return;

      case MessageType.UpdateProperty:
        return updateProperty(previousTree,
          message.content.path,
          message.content.newValue);

      case MessageType.UpdateProviderProperty:
        return updateProviderProperty(previousTree,
          message.content.path,
          message.content.token,
          message.content.propertyPath,
          message.content.newValue);

      case MessageType.EmitValue:
        return emitValue(previousTree,
          message.content.path,
          message.content.value);

    }
    return undefined;
  });
};


browserSubscribe(messageHandler);

// We do not store component instance properties on the node itself because
// we do not want to have to serialize them across backend-frontend boundaries.
// So we look them up using ng.probe, and only when the node is selected.
const getComponentInstance = (tree: MutableTree, node: Node) => {
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      return instanceWithMetadata(probed, node, probed.componentInstance);
    }
  }
  return null;
};

const updateNode = (tree: MutableTree, path: Path, fn: (element) => void) => {
  const node = getNodeFromPartialPath(tree, path);
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      const ngZone = probed.injector.get(ng.coreTokens.NgZone);
      setTimeout(() => ngZone.run(() => fn(probed)));
    }
  }
};

const updateProperty = (tree: MutableTree, path: Path, newValue) => {
  updateNode(tree, path, probed => {
    const instanceParent = getNodeInstanceParent(probed, path);
    if (instanceParent) {
      instanceParent[path[path.length - 1]] = newValue;
    }
  });
};

const updateProviderProperty = (tree: MutableTree, path: Path, token: string, propertyPath: Path, newValue) => {
  updateNode(tree, path, probed => {
    const provider = getNodeProvider(probed, token, propertyPath);
    if (provider) {
      provider[propertyPath[propertyPath.length - 1]] = newValue;
    }
  });
};

const emitValue = (tree: MutableTree, path: Path, newValue) => {
  const node = getNodeFromPartialPath(tree, path);
  if (node) {
    const probed = ng.probe(node.nativeElement());
    if (probed) {
      const instanceParent = getNodeInstanceParent(probed, path);
      if (instanceParent) {
        const ngZone = probed.injector.get(ng.coreTokens.NgZone);
        setTimeout(() => {
          ngZone.run(() => {
            const emittable = instanceParent[path[path.length - 1]];
            if (typeof emittable.emit === 'function') {
              emittable.emit(newValue);
            }
            else if (typeof emittable.next === 'function') {
              emittable.next(newValue);
            }
            else {
              throw new Error(`Cannot emit value for ${serializePath(path)}`);
            }
          });
        });
      }
    }
  }
};

export const routersFromRoots = () => {
  const routers = [];

  for (const element of getAllAngularRootElements().map(e => ng.probe(e))) {
    const routerFn = parameterTypes(element.componentInstance).reduce((prev, curr, idx, p) =>
      prev ? prev : p[idx] !== null && p[idx].name === 'Router' ? p[idx] : null, null);
    if (routerFn &&
        element.componentInstance.router &&
        element.componentInstance.router instanceof routerFn) {
      routers.push(element.componentInstance.router);
    }
  }

  return routers;
};

export const routerTree = (): Array<any> => {
  let routers = new Array<any>();

  if (ng.coreTokens.Router) {
    for (const rootElement of getAllAngularRootElements()) {
      routers = routers.concat(ng.probe(rootElement).injector.get(ng.coreTokens.Router));
    }
  } else {
    for (const router of routersFromRoots()) {
      routers = routers.concat(router);
    }
  }

  return routers;
};

export const consoleReference = (node: Node) => {
  Object.defineProperty(window, selectedComponentPropertyKey, {
    get: () => {
      if (node) {
        return ng.probe(node.nativeElement());
      }
      return null;
    }
  });
};

/// We need to define some operations that are accessible from the global scope so that
/// the frontend can invoke them using {@link inspectedWindow.eval}. But we try to do it
/// in a safe way and ensure that we do not overwrite any existing properties or functions
/// that share the same names. If we do encounter such things we throw an exception and
/// complain about it instead of continuing with bootstrapping.
export const extendWindowOperations = <T>(target, classImpl: T) => {
  for (const key of Object.keys(classImpl)) {
    if (target[key] != null) {
      throw new Error(`A window function or object named ${key} would be overwritten`);
    }
  }

  Object.assign(target, classImpl);
};

export const applicationOperations = {
  /// Note that the ID is a serialized path, and the first element in that path is the
  /// index of the application that the node belongs to. So even though we have this
  /// global lookup operation for things like 'inspect' and 'view source', it will find
  /// the correct node even if multiple applications are instantiated on the same page.
  nodeFromPath: (id: string): Element => {
    if (previousTree == null) {
      throw new Error('No tree exists');
    }

    const node = previousTree.lookup(id);
    if (node == null) {
      console.error(`Cannot find element associated with node ${id}`);
      return null;
    }
    return node.nativeElement();
  },

  /// Post a response to a message from the frontend and dispatch it through normal channels
  response: <T>(response: Message<T>) => {
    browserDispatch(response);
  },
  /// Run the message handler and return the result immediately instead of posting a response
  handleImmediate: <T>(message: Message<T>) => {
    const result = messageHandler(message);
    if (result) {
      return serialize(result);
    }
    return null;
  },
  /// Read all messages in the buffer and remove them
  readMessageQueue: (): Array<Message<any>> => {
    return messageBuffer.dequeue();
  }
};

/* We want to find the right element based on the selected DOM node
 * To do this we execute the findElement function on receiving the FindElement message
 * In turn this function will bind an event listener to the window that listens to
 * DOM trigger on mouseover. Onmousedown it will trigger a cancellation of the selection and
 * if a node was found highlight it in the augury mutable tree
 *
 * The function references of the event handlers are stored on the global scope of backend.ts
 * so we can remove them by reference.
 */
const findElement = (message) => {
  let currentNode: Node,
    currentHighlights: any;

  if (message.content.start) {
    onMouseOver = (e) => {
      if (currentHighlights) {
        clearHighlights(currentHighlights.map);
      }

      currentNode = onFindElement(e, previousTree);

      if (currentNode) {
        currentHighlights = highlight([currentNode]);
      }
    };

    onMouseDown = () => {
      onElementFound(currentNode, currentHighlights, messageBuffer);
    };

    window.addEventListener('mouseover', onMouseOver, false);
    window.addEventListener('mousedown', onMouseDown, false);
  }

  // selection has ended
  if (message.content.stop) {
    window.removeEventListener('mouseover', onMouseOver, false);
    window.removeEventListener('mousedown', onMouseDown, false);
  }
};


// add custom operations
extendWindowOperations(window || global || this, {inspectedApplication: applicationOperations});
