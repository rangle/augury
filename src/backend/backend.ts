import { compare } from '../utils/patch';
import { isAngular, isDebugMode } from './utils/app-check';

import { instanceWithMetadata, MutableTree, Node, Path, serializePath } from '../tree';

import { onElementFound, onFindElement } from './utils/find-element';

import { NgModulesRegistry, parseModulesFromRootElement, parseModulesFromRouter } from './utils/parse-modules';

import { parseNgVersion } from './utils/parse-ng-version';

import { createTreeFromElements } from '../tree/mutable-tree-factory';

import {
  ApplicationError,
  ApplicationErrorType,
  browserDispatch,
  browserSubscribe,
  Message,
  MessageFactory,
  MessageType
} from '../communication';

import { parameterTypes } from '../tree/decorators';

import { send } from './indirect-connection';

import {
  clear as clearHighlights,
  getNodeFromPartialPath,
  getNodeInstanceParent,
  getNodeProvider,
  highlight,
  parseRoutes,
  Route
} from './utils';

import { serialize } from '../utils';
import { MessageQueue } from '../structures';
import { SimpleOptions } from '../options';

import { MessagePipeBackend } from 'feature-modules/.lib';
import { highlighter } from 'feature-modules/highlighter/backend/index';
import { ApplicationRef, NgModuleRef } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { filter, takeWhile } from 'rxjs/operators';

import 'reflect-metadata';

declare const ng;
declare const getAllAngularRootElements: () => Element[];
declare const treeRenderOptions: SimpleOptions;

/// For tree deltas that contain more changes than {@link deltaThreshold},
/// we simply send the entire tree again instead of trying to patch it
/// since it will be faster than trying to apply hundreds or thousands of
/// changes to an existing tree.
const deltaThreshold = 512;

/// ms inbetween checks for newly created ng module after onDestroy called on previous one.
/// This is to support HMR.
const CHECK_AFTER_NG_MODULE_DESTROY_RATE_MS = 50;

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
  tokenIdMap: {}
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
    send(
      MessageFactory.uncaughtApplicationError({
        name: e.name,
        stack: e.stack,
        message: e.message
      })
    );
  }
};

const sendNgVersionMessage = () => {
  const ngVersion = parseNgVersion();
  send(MessageFactory.ngVersion(ngVersion));
};

const logAuguryDetected = () => {
  const ngVersion = parseNgVersion();
  console.log(
    `%c Augury %c Detected Angular %c v${ngVersion} %c`,
    'background:#3e5975 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff; font-size: 14px;',
    'background:#DD0031 ; padding: 1px; color: #fff; font-size: 14px;',
    'background:#C3002F ; padding: 1px; border-radius: 0px 3px 3px 0;  color: #fff; font-size: 14px;',
    'background:transparent'
  );
};

const sendNgModulesMessage = () => {
  const ngModulesMessage = {
    names: parsedModulesData.names,
    tokenIdMap: parsedModulesData.tokenIdMap,
    configs: parsedModulesData.configs
  };
  messageBuffer.enqueue(MessageFactory.ngModules(ngModulesMessage));
  send(MessageFactory.push());
};

const updateComponentTree = async (roots: Array<any>, sendUpdates: boolean = true) => {
  const { tree, count } = createTreeFromElements(roots, treeRenderOptions);
  if (sendUpdates) {
    if (previousTree == null || Math.abs(previousCount - count) > deltaThreshold) {
      messageBuffer.enqueue(MessageFactory.completeTree(tree));
    } else {
      const changes = previousTree.diff(tree);
      if (changes.length > 0) {
        lastTreeMessage = 'diff';
        messageBuffer.enqueue(MessageFactory.treeDiff(changes));
      } else {
        if (lastTreeMessage === 'no-diff') {
          return;
        }
        lastTreeMessage = 'no-diff';
        messageBuffer.enqueue(MessageFactory.treeUnchanged());
      }
    }

    /// Send a message through the normal channels to indicate to the frontend
    /// that messages are waiting for it in {@link messageBuffer}
    send(MessageFactory.push());
  }

  previousTree = tree;
  highlighter.useComponentTreeInstance(previousTree);

  previousCount = count;
};

const updateLazyLoadedNgModules = (routers): Promise<void> => {
  return Promise.resolve().then(() => {
    routers.forEach(router => {
      parseModulesFromRouter(router, parsedModulesData);
    });

    sendNgModulesMessage();
  });
};

const updateRouterTree = () => {
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

let ngModuleRef: NgModuleRef<any>;
let isStableSubscription: Subscription;

const collectRoots = () =>
  getAllAngularRootElements()
    .map(root => ng.probe(root))
    .filter(debugRoot => debugRoot !== null);

const listenForSomeTimeAndMaybeResubscribe = (timeMs: number) => {
  timer(CHECK_AFTER_NG_MODULE_DESTROY_RATE_MS, CHECK_AFTER_NG_MODULE_DESTROY_RATE_MS)
    .pipe(takeWhile((_, i) => !ngModuleRef && i < 100))
    .forEach(() => {
      resubscribe();
    });
};

const resubscribe = () => {
  runAndHandleUncaughtExceptions(() => {
    logAuguryDetected();
    sendNgVersionMessage();

    messageBuffer.clear();

    ngModuleRef = undefined;
    parsedModulesData.modules = {};
    parsedModulesData.names = [];
    parsedModulesData.configs = {};
    parsedModulesData.tokenIdMap = {};

    setTimeout(() => {
      Promise.resolve()
        .then(() => {
          runAndHandleUncaughtExceptions(() => {
            const roots = collectRoots();
            if (roots.length) {
              let sanity;
              // Adding sanity threshold to make sure
              // larger app's doesn't get flooded
              const sanityThreshold = 0.2 * 1000; // 0.2 seconds
              const appRef: ApplicationRef = parseModulesFromRootElement(roots[0], parsedModulesData);
              if (isStableSubscription) {
                isStableSubscription.unsubscribe();
              }
              isStableSubscription = appRef.isStable
                .pipe(
                  // Make sure sanity is undefined (initial run) or that sanitythreshold is passed
                  filter(() => sanity === undefined || new Date().getTime() - sanity > sanityThreshold)
                )
                .subscribe(e => {
                  setTimeout(() => {
                    sanity = new Date().getTime();
                    updateComponentTree(collectRoots());
                    updateRouterTree();
                    send(MessageFactory.ping());
                  });
                });
              ngModuleRef = (appRef as any)._injector;
              ngModuleRef.onDestroy(() => {
                ngModuleRef = undefined;
                listenForSomeTimeAndMaybeResubscribe(1000);
              });
              sendNgModulesMessage();
            }
          });
        })
        .then(() =>
          runAndHandleUncaughtExceptions(() => {
            previousRoutes = null;
            updateRouterTree();
          })
        )
        .then(() => onUpdateNotifier.next());
    });
  });
};

const selectedComponentPropertyKey = '$$el';

const noSelectedComponentWarningText = 'There is no component selected.';

Object.defineProperty(window, selectedComponentPropertyKey, {
  value: noSelectedComponentWarningText,
  configurable: true
});

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
          send(MessageFactory.applicationError(new ApplicationError(ApplicationErrorType.ProductionMode)));
        } else {
          resubscribe();
        }

        return true;

      case MessageType.Refresh:
        resubscribe();
        return true;

      case MessageType.SelectComponent:
        const path: Path = message.content.path;
        updateComponentTree(collectRoots(), false);
        if (previousTree) {
          const node = previousTree.traverse(path);
          this.consoleReference(node);

          // For component selection events, we respond with component instance
          // properties for the selected node. If we had to serialize the
          // properties of each node on the tree that would be a performance
          // killer, so we only send the componentInstance values for the
          // node that has been selected.
          return getComponentInstance(node);
        }
        return;

      case MessageType.UpdateProperty:
        return updateProperty(previousTree, message.content.path, message.content.newValue);

      case MessageType.UpdateProviderProperty:
        return updateProviderProperty(
          previousTree,
          message.content.path,
          message.content.token,
          message.content.propertyPath,
          message.content.newValue
        );

      case MessageType.EmitValue:
        return emitValue(previousTree, message.content.path, message.content.value);
    }
    return undefined;
  });
};

browserSubscribe(messageHandler);

// We do not store component instance properties on the node itself because
// we do not want to have to serialize them across backend-frontend boundaries.
// So we look them up using ng.probe, and only when the node is selected.
const getComponentInstance = (node: Node) => {
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
            } else if (typeof emittable.next === 'function') {
              emittable.next(newValue);
            } else {
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

  for (const element of collectRoots()) {
    const routerFn = parameterTypes(element.componentInstance).reduce(
      (prev, curr, idx, p) => (prev ? prev : p[idx] !== null && p[idx].name === 'Router' ? p[idx] : null),
      null
    );
    if (routerFn && element.componentInstance.router && element.componentInstance.router instanceof routerFn) {
      routers.push(element.componentInstance.router);
    }
  }

  return routers;
};

export const routerTree = (): Array<any> => {
  let routers = new Array<any>();

  if (ng.coreTokens.Router) {
    for (const rootElement of collectRoots()) {
      routers = routers.concat(rootElement.injector.get(ng.coreTokens.Router));
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
    },
    configurable: true
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
    return 'null';
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
const findElement = message => {
  let currentNode: Node, currentHighlights: any;

  if (message.content.start) {
    onMouseOver = e => {
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
extendWindowOperations(window || global || this, { inspectedApplication: applicationOperations });
