(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var core = require('../core');
var microtask = require('../microtask');
var browserPatch = require('../patch/browser');
var es6Promise = require('../ext/es6-promise.js');

if (global.Zone) {
  console.warn('Zone already exported on window the object!');
}

global.Zone = microtask.addMicrotaskSupport(core.Zone);
global.zone = new global.Zone();

// Monkey path ẗhe Promise implementation to add support for microtasks
global.Promise = es6Promise.Promise;

browserPatch.apply();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core":2,"../ext/es6-promise.js":3,"../microtask":4,"../patch/browser":5}],2:[function(require,module,exports){
(function (global){
'use strict';

function Zone(parentZone, data) {
  var zone = (arguments.length) ? Object.create(parentZone) : this;

  zone.parent = parentZone || null;

  Object.keys(data || {}).forEach(function(property) {

    var _property = property.substr(1);

    // augment the new zone with a hook decorates the parent's hook
    if (property[0] === '$') {
      zone[_property] = data[property](parentZone[_property] || function () {});

    // augment the new zone with a hook that runs after the parent's hook
    } else if (property[0] === '+') {
      if (parentZone[_property]) {
        zone[_property] = function () {
          var result = parentZone[_property].apply(this, arguments);
          data[property].apply(this, arguments);
          return result;
        };
      } else {
        zone[_property] = data[property];
      }

    // augment the new zone with a hook that runs before the parent's hook
    } else if (property[0] === '-') {
      if (parentZone[_property]) {
        zone[_property] = function () {
          data[property].apply(this, arguments);
          return parentZone[_property].apply(this, arguments);
        };
      } else {
        zone[_property] = data[property];
      }

    // set the new zone's hook (replacing the parent zone's)
    } else {
      zone[property] = (typeof data[property] === 'object') ?
                        JSON.parse(JSON.stringify(data[property])) :
                        data[property];
    }
  });

  zone.$id = Zone.nextId++;

  return zone;
}

Zone.prototype = {
  constructor: Zone,

  fork: function (locals) {
    this.onZoneCreated();
    return new Zone(this, locals);
  },

  bind: function (fn, skipEnqueue) {
    skipEnqueue || this.enqueueTask(fn);
    var zone = this.isRootZone() ? this : this.fork();
    return function zoneBoundFn() {
      return zone.run(fn, this, arguments);
    };
  },

  bindOnce: function (fn) {
    var boundZone = this;
    return this.bind(function () {
      var result = fn.apply(this, arguments);
      boundZone.dequeueTask(fn);
      return result;
    });
  },

  isRootZone: function() {
    return this.parent === null;
  },

  run: function run (fn, applyTo, applyWith) {
    applyWith = applyWith || [];

    var oldZone = global.zone;

    // MAKE THIS ZONE THE CURRENT ZONE
    global.zone = this;

    try {
      this.beforeTask();
      return fn.apply(applyTo, applyWith);
    } catch (e) {
      if (this.onError) {
        this.onError(e);
      } else {
        throw e;
      }
    } finally {
      this.afterTask();
      // REVERT THE CURRENT ZONE BACK TO THE ORIGINAL ZONE
      global.zone = oldZone;
    }
  },

  // onError is used to override error handling.
  // When a custom error handler is provided, it should most probably rethrow the exception
  // not to break the expected control flow:
  //
  // `promise.then(fnThatThrows).catch(fn);`
  //
  // When this code is executed in a zone with a custom onError handler that doesn't rethrow, the
  // `.catch()` branch will not be taken as the `fnThatThrows` exception will be swallowed by the
  // handler.
  onError: null,
  beforeTask: function () {},
  onZoneCreated: function () {},
  afterTask: function () {},
  enqueueTask: function () {},
  dequeueTask: function () {}
};

// Root zone ID === 1
Zone.nextId = 1;

Zone.bindPromiseFn = require('./patch/promise').bindPromiseFn;

module.exports = {
  Zone: Zone
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./patch/promise":10}],3:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.1.1
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    function lib$es6$promise$asap$$asap(callback, arg) {
      window.zone.scheduleMicrotask(function() {
        callback(arg);
      });
      //queue[len] = callback;
      //queue[len + 1] = arg;
      //len += 2;
      //if (len === 2) {
      //  // If len is 2, that means that we need to schedule an async flush.
      //  // If additional callbacks are queued before the queue is flushed, they
      //  // will be processed by this flush that we are scheduling.
      //  scheduleFlush();
      //}
    }

    var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$default(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$default(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,{},typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
'use strict';

function scheduleMicrotask(fn) {
  asap(this.bind(fn));
}

function addMicrotaskSupport(zoneClass) {
  zoneClass.prototype.scheduleMicrotask = scheduleMicrotask;
  return zoneClass;
}

module.exports = {
  addMicrotaskSupport: addMicrotaskSupport
};

// TODO(vicb): There are plan to be able to use asap() from es6-promise
// see https://github.com/jakearchibald/es6-promise/pull/113
// for now adapt code from asap.js in es6-promise
// Note: the node support has been dropped here

// TODO(vicb): Create a benchmark for the different methods & the usage of the queue
// see https://github.com/angular/zone.js/issues/97

var len = 0;

var hasNativePromise = typeof Promise ==! "undefined" &&
                       Promise.toString().indexOf("[native code]") !== -1;

var isFirefox = global.navigator &&
                global.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

function asap(callback) {
  queue[len] = callback;
  len += 1;
  if (len === 1) {
    scheduleFlush();
  }
}

var browserWindow = (typeof global.window !== 'undefined') ? global.window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' &&
  typeof importScripts !== 'undefined' &&
  typeof MessageChannel !== 'undefined';

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  return function() {
    setTimeout(flush, 1);
  };
}

function usePromise() {
  var resolvedPromise = Promise.resolve(void 0);
  return function() {
    resolvedPromise.then(flush);
  }
}

var queue = new Array(1000);

function flush() {
  for (var i = 0; i < len; i++) {
    var callback = queue[i];
    callback();
    queue[i] = undefined;
  }

  len = 0;
}

var scheduleFlush;
// Decide what async method to use to triggering processing of queued callbacks:
if (hasNativePromise && !isFirefox) {
  // TODO(vicb): remove '!isFirefox' when the bug is fixed:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1162013
  scheduleFlush = usePromise();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else {
  scheduleFlush = useSetTimeout();
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var fnPatch = require('./functions');
var promisePatch = require('./promise');
var mutationObserverPatch = require('./mutation-observer');
var definePropertyPatch = require('./define-property');
var registerElementPatch = require('./register-element');
var webSocketPatch = require('./websocket');
var eventTargetPatch = require('./event-target');
var propertyDescriptorPatch = require('./property-descriptor');

function apply() {
  fnPatch.patchSetClearFunction(global, [
    'timeout',
    'interval',
    'immediate'
  ]);

  fnPatch.patchSetFunction(global, [
    'requestAnimationFrame',
    'mozRequestAnimationFrame',
    'webkitRequestAnimationFrame'
  ]);

  fnPatch.patchFunction(global, [
    'alert',
    'prompt'
  ]);

  eventTargetPatch.apply();

  propertyDescriptorPatch.apply();

  promisePatch.apply();

  mutationObserverPatch.patchClass('MutationObserver');
  mutationObserverPatch.patchClass('WebKitMutationObserver');

  definePropertyPatch.apply();

  registerElementPatch.apply();
}

module.exports = {
  apply: apply
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./define-property":6,"./event-target":7,"./functions":8,"./mutation-observer":9,"./promise":10,"./property-descriptor":11,"./register-element":12,"./websocket":13}],6:[function(require,module,exports){
'use strict';

// might need similar for object.freeze
// i regret nothing

var _defineProperty = Object.defineProperty;
var _getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var _create = Object.create;

function apply() {
  Object.defineProperty = function (obj, prop, desc) {
    if (isUnconfigurable(obj, prop)) {
      throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
    }
    if (prop !== 'prototype') {
      desc = rewriteDescriptor(obj, prop, desc);
    }
    return _defineProperty(obj, prop, desc);
  };

  Object.defineProperties = function (obj, props) {
    Object.keys(props).forEach(function (prop) {
      Object.defineProperty(obj, prop, props[prop]);
    });
    return obj;
  };

  Object.create = function (obj, proto) {
    if (typeof proto === 'object') {
      Object.keys(proto).forEach(function (prop) {
        proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
      });
    }
    return _create(obj, proto);
  };

  Object.getOwnPropertyDescriptor = function (obj, prop) {
    var desc = _getOwnPropertyDescriptor(obj, prop);
    if (isUnconfigurable(obj, prop)) {
      desc.configurable = false;
    }
    return desc;
  };
};

function _redefineProperty(obj, prop, desc) {
  desc = rewriteDescriptor(obj, prop, desc);
  return _defineProperty(obj, prop, desc);
};

function isUnconfigurable (obj, prop) {
  return obj && obj.__unconfigurables && obj.__unconfigurables[prop];
}

function rewriteDescriptor (obj, prop, desc) {
  desc.configurable = true;
  if (!desc.configurable) {
    if (!obj.__unconfigurables) {
      _defineProperty(obj, '__unconfigurables', { writable: true, value: {} });
    }
    obj.__unconfigurables[prop] = true;
  }
  return desc;
}

module.exports = {
  apply: apply,
  _redefineProperty: _redefineProperty
};



},{}],7:[function(require,module,exports){
(function (global){
'use strict';

var utils = require('../utils');

function apply() {
  // patched properties depend on addEventListener, so this needs to come first
  if (global.EventTarget) {
    utils.patchEventTargetMethods(global.EventTarget.prototype);

  // Note: EventTarget is not available in all browsers,
  // if it's not available, we instead patch the APIs in the IDL that inherit from EventTarget
  } else {
    var apis = [ 'ApplicationCache',
      'EventSource',
      'FileReader',
      'InputMethodContext',
      'MediaController',
      'MessagePort',
      'Node',
      'Performance',
      'SVGElementInstance',
      'SharedWorker',
      'TextTrack',
      'TextTrackCue',
      'TextTrackList',
      'WebKitNamedFlow',
      'Window',
      'Worker',
      'WorkerGlobalScope',
      'XMLHttpRequestEventTarget',
      'XMLHttpRequestUpload'
    ];

    apis.forEach(function(thing) {
      global[thing] && utils.patchEventTargetMethods(global[thing].prototype);
    });
  }
}

module.exports = {
  apply: apply
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils":14}],8:[function(require,module,exports){
(function (global){
'use strict';

var utils = require('../utils');

function patchSetClearFunction(obj, fnNames) {
  fnNames.map(function (name) {
    return name[0].toUpperCase() + name.substr(1);
  }).forEach(function (name) {
    var setName = 'set' + name;
    var delegate = obj[setName];

    if (delegate) {
      var clearName = 'clear' + name;
      var ids = {};

      var bindArgs = setName === 'setInterval' ? utils.bindArguments : utils.bindArgumentsOnce;

      global.zone[setName] = function (fn) {
        var id, fnRef = fn;
        arguments[0] = function () {
          delete ids[id];
          return fnRef.apply(this, arguments);
        };
        var args = bindArgs(arguments);
        id = delegate.apply(obj, args);
        ids[id] = true;
        return id;
      };

      obj[setName] = function () {
        return global.zone[setName].apply(this, arguments);
      };

      var clearDelegate = obj[clearName];

      global.zone[clearName] = function (id) {
        if (ids[id]) {
          delete ids[id];
          global.zone.dequeueTask();
        }
        return clearDelegate.apply(this, arguments);
      };

      obj[clearName] = function () {
        return global.zone[clearName].apply(this, arguments);
      };
    }
  });
};

function patchSetFunction(obj, fnNames) {
  fnNames.forEach(function (name) {
    var delegate = obj[name];

    if (delegate) {
      global.zone[name] = function (fn) {
        var fnRef = fn;
        arguments[0] = function () {
          return fnRef.apply(this, arguments);
        };
        var args = utils.bindArgumentsOnce(arguments);
        return delegate.apply(obj, args);
      };

      obj[name] = function () {
        return zone[name].apply(this, arguments);
      };
    }
  });
};

function patchFunction(obj, fnNames) {
  fnNames.forEach(function (name) {
    var delegate = obj[name];
    global.zone[name] = function () {
      return delegate.apply(obj, arguments);
    };

    obj[name] = function () {
      return global.zone[name].apply(this, arguments);
    };
  });
};


module.exports = {
  patchSetClearFunction: patchSetClearFunction,
  patchSetFunction: patchSetFunction,
  patchFunction: patchFunction
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils":14}],9:[function(require,module,exports){
(function (global){
'use strict';

// wrap some native API on `window`
function patchClass(className) {
  var OriginalClass = global[className];
  if (!OriginalClass) return;

  global[className] = function (fn) {
    this._o = new OriginalClass(global.zone.bind(fn, true));
    // Remember where the class was instantiate to execute the enqueueTask and dequeueTask hooks
    this._creationZone = global.zone;
  };

  var instance = new OriginalClass(function () {});

  global[className].prototype.disconnect = function () {
    var result = this._o.disconnect.apply(this._o, arguments);
    if (this._active) {
      this._creationZone.dequeueTask();
      this._active = false;
    }
    return result;
  };

  global[className].prototype.observe = function () {
    if (!this._active) {
      this._creationZone.enqueueTask();
      this._active = true;
    }
    return this._o.observe.apply(this._o, arguments);
  };

  var prop;
  for (prop in instance) {
    (function (prop) {
      if (typeof global[className].prototype !== undefined) {
        return;
      }
      if (typeof instance[prop] === 'function') {
        global[className].prototype[prop] = function () {
          return this._o[prop].apply(this._o, arguments);
        };
      } else {
        Object.defineProperty(global[className].prototype, prop, {
          set: function (fn) {
            if (typeof fn === 'function') {
              this._o[prop] = global.zone.bind(fn);
            } else {
              this._o[prop] = fn;
            }
          },
          get: function () {
            return this._o[prop];
          }
        });
      }
    }(prop));
  }
};

module.exports = {
  patchClass: patchClass
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
'use strict';

var utils = require('../utils');

/*
 * patch a fn that returns a promise
 */
var bindPromiseFn = (function() {
  // if the browser natively supports Promises, we can just return a native promise
  if (global.Promise) {
    return function (delegate) {
      return function() {
        var delegatePromise = delegate.apply(this, arguments);
        if (delegatePromise instanceof Promise) {
          return delegatePromise;
        } else {
          return new Promise(function(resolve, reject) {
            delegatePromise.then(resolve, reject);
          });
        }
      };
    };
  } else {
    // if the browser does not have native promises, we have to patch each promise instance
    return function (delegate) {
      return function () {
        return patchThenable(delegate.apply(this, arguments));
      };
    };
  }

  function patchThenable(thenable) {
    var then = thenable.then;
    thenable.then = function () {
      var args = utils.bindArguments(arguments);
      var nextThenable = then.apply(thenable, args);
      return patchThenable(nextThenable);
    };

    var ocatch = thenable.catch;
    thenable.catch = function () {
      var args = utils.bindArguments(arguments);
      var nextThenable = ocatch.apply(thenable, args);
      return patchThenable(nextThenable);
    };
    return thenable;
  }
}());

function apply() {
  if (global.Promise) {
    utils.patchPrototype(Promise.prototype, [
      'then',
      'catch'
    ]);
  }
}

module.exports = {
  apply: apply,
  bindPromiseFn: bindPromiseFn
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils":14}],11:[function(require,module,exports){
(function (global){
'use strict';

var webSocketPatch = require('./websocket');
var utils = require('../utils');

var eventNames = 'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'.split(' ');

function apply() {
  if (canPatchViaPropertyDescriptor()) {
    // for browsers that we can patch the descriptor:  Chrome & Firefox
    var onEventNames = eventNames.map(function (property) {
      return 'on' + property;
    });
    utils.patchProperties(HTMLElement.prototype, onEventNames);
    utils.patchProperties(XMLHttpRequest.prototype);
    utils.patchProperties(WebSocket.prototype);
  } else {
    // Safari
    patchViaCapturingAllTheEvents();
    utils.patchClass('XMLHttpRequest');
    webSocketPatch.apply();
  }
}

function canPatchViaPropertyDescriptor() {
  if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') && typeof Element !== 'undefined') {
    // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
    // IDL interface attributes are not configurable
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
    if (desc && !desc.configurable) return false;
  }

  Object.defineProperty(HTMLElement.prototype, 'onclick', {
    get: function () {
      return true;
    }
  });
  var elt = document.createElement('div');
  var result = !!elt.onclick;
  Object.defineProperty(HTMLElement.prototype, 'onclick', {});
  return result;
};

// Whenever any event fires, we check the event target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents() {
  eventNames.forEach(function (property) {
    var onproperty = 'on' + property;
    document.addEventListener(property, function (event) {
      var elt = event.target, bound;
      while (elt) {
        if (elt[onproperty] && !elt[onproperty]._unbound) {
          bound = global.zone.bind(elt[onproperty]);
          bound._unbound = elt[onproperty];
          elt[onproperty] = bound;
        }
        elt = elt.parentElement;
      }
    }, true);
  });
};

module.exports = {
  apply: apply
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils":14,"./websocket":13}],12:[function(require,module,exports){
(function (global){
'use strict';

var _redefineProperty = require('./define-property')._redefineProperty;

function apply() {
  if (!('registerElement' in global.document)) {
    return;
  }

  var _registerElement = document.registerElement;
  var callbacks = [
    'createdCallback',
    'attachedCallback',
    'detachedCallback',
    'attributeChangedCallback'
  ];

  document.registerElement = function (name, opts) {
    callbacks.forEach(function (callback) {
      if (opts.prototype[callback]) {
        var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
        if (descriptor.value) {
          descriptor.value = global.zone.bind(descriptor.value || opts.prototype[callback]);
          _redefineProperty(opts.prototype, callback, descriptor);
        }
      }
    });
    return _registerElement.apply(document, [name, opts]);
  };
}

module.exports = {
  apply: apply
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./define-property":6}],13:[function(require,module,exports){
(function (global){
'use strict';

var utils = require('../utils.js');

// we have to patch the instance since the proto is non-configurable
function apply() {
  var WS = global.WebSocket;
  utils.patchEventTargetMethods(WS.prototype);
  global.WebSocket = function(a, b) {
    var socket = arguments.length > 1 ? new WS(a, b) : new WS(a);
    var proxySocket;

    // Safari 7.0 has non-configurable own 'onmessage' and friends properties on the socket instance
    var onmessageDesc = Object.getOwnPropertyDescriptor(socket, 'onmessage');
    if (onmessageDesc && onmessageDesc.configurable === false) {
      proxySocket = Object.create(socket);
      ['addEventListener', 'removeEventListener', 'send', 'close'].forEach(function(propName) {
        proxySocket[propName] = function() {
          return socket[propName].apply(socket, arguments);
        };
      });
    } else {
      // we can patch the real socket
      proxySocket = socket;
    }

    utils.patchProperties(proxySocket, ['onclose', 'onerror', 'onmessage', 'onopen']);

    return proxySocket;
  };
}

module.exports = {
  apply: apply
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils.js":14}],14:[function(require,module,exports){
(function (global){
'use strict';

function bindArguments(args) {
  for (var i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'function') {
      args[i] = global.zone.bind(args[i]);
    }
  }
  return args;
};

function bindArgumentsOnce(args) {
  for (var i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'function') {
      args[i] = global.zone.bindOnce(args[i]);
    }
  }
  return args;
};

function patchPrototype(obj, fnNames) {
  fnNames.forEach(function (name) {
    var delegate = obj[name];
    if (delegate) {
      obj[name] = function () {
        return delegate.apply(this, bindArguments(arguments));
      };
    }
  });
};

function patchProperty(obj, prop) {
  var desc = Object.getOwnPropertyDescriptor(obj, prop) || {
    enumerable: true,
    configurable: true
  };

  // A property descriptor cannot have getter/setter and be writable
  // deleting the writable and value properties avoids this error:
  //
  // TypeError: property descriptors must not specify a value or be writable when a
  // getter or setter has been specified
  delete desc.writable;
  delete desc.value;

  // substr(2) cuz 'onclick' -> 'click', etc
  var eventName = prop.substr(2);
  var _prop = '_' + prop;

  desc.set = function (fn) {
    if (this[_prop]) {
      this.removeEventListener(eventName, this[_prop]);
    }

    if (typeof fn === 'function') {
      this[_prop] = fn;
      this.addEventListener(eventName, fn, false);
    } else {
      this[_prop] = null;
    }
  };

  desc.get = function () {
    return this[_prop];
  };

  Object.defineProperty(obj, prop, desc);
};

function patchProperties(obj, properties) {

  (properties || (function () {
      var props = [];
      for (var prop in obj) {
        props.push(prop);
      }
      return props;
    }()).
    filter(function (propertyName) {
      return propertyName.substr(0,2) === 'on';
    })).
    forEach(function (eventName) {
      patchProperty(obj, eventName);
    });
};

function patchEventTargetMethods(obj) {
  var addDelegate = obj.addEventListener;
  obj.addEventListener = function (eventName, fn) {
    fn._bound = fn._bound || {};
    arguments[1] = fn._bound[eventName] = zone.bind(fn);
    return addDelegate.apply(this, arguments);
  };

  var removeDelegate = obj.removeEventListener;
  obj.removeEventListener = function (eventName, fn) {
    if(arguments[1]._bound && arguments[1]._bound[eventName]) {
      var _bound = arguments[1]._bound;
      arguments[1] = _bound[eventName];
      delete _bound[eventName];
    }
    var result = removeDelegate.apply(this, arguments);
    global.zone.dequeueTask(fn);
    return result;
  };
};

// wrap some native API on `window`
function patchClass(className) {
  var OriginalClass = global[className];
  if (!OriginalClass) return;

  global[className] = function () {
    var a = bindArguments(arguments);
    switch (a.length) {
      case 0: this._o = new OriginalClass(); break;
      case 1: this._o = new OriginalClass(a[0]); break;
      case 2: this._o = new OriginalClass(a[0], a[1]); break;
      case 3: this._o = new OriginalClass(a[0], a[1], a[2]); break;
      case 4: this._o = new OriginalClass(a[0], a[1], a[2], a[3]); break;
      default: throw new Error('what are you even doing?');
    }
  };

  var instance = new OriginalClass(className.substr(-16) === 'MutationObserver' ? function () {} : undefined);

  var prop;
  for (prop in instance) {
    (function (prop) {
      if (typeof instance[prop] === 'function') {
        global[className].prototype[prop] = function () {
          return this._o[prop].apply(this._o, arguments);
        };
      } else {
        Object.defineProperty(global[className].prototype, prop, {
          set: function (fn) {
            if (typeof fn === 'function') {
              this._o[prop] = global.zone.bind(fn);
            } else {
              this._o[prop] = fn;
            }
          },
          get: function () {
            return this._o[prop];
          }
        });
      }
    }(prop));
  };
};

module.exports = {
  bindArguments: bindArguments,
  bindArgumentsOnce: bindArgumentsOnce,
  patchPrototype: patchPrototype,
  patchProperty: patchProperty,
  patchProperties: patchProperties,
  patchEventTargetMethods: patchEventTargetMethods,
  patchClass: patchClass
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);

/*
 * Wrapped stacktrace
 *
 * We need this because in some implementations, constructing a trace is slow
 * and so we want to defer accessing the trace for as long as possible
 */
Zone.Stacktrace = function (e) {
  this._e = e;
};
Zone.Stacktrace.prototype.get = function () {
  if (zone.stackFramesFilter) {
    return this._e.stack.
        split('\n').
        filter(zone.stackFramesFilter).
        join('\n');
  }
  return this._e.stack;
}

Zone.getStacktrace = function () {
  function getStacktraceWithUncaughtError () {
    return new Zone.Stacktrace(new Error());
  }

  function getStacktraceWithCaughtError () {
    try {
      throw new Error();
    } catch (e) {
      return new Zone.Stacktrace(e);
    }
  }

  // Some implementations of exception handling don't create a stack trace if the exception
  // isn't thrown, however it's faster not to actually throw the exception.
  var stack = getStacktraceWithUncaughtError();
  if (stack && stack._e.stack) {
    Zone.getStacktrace = getStacktraceWithUncaughtError;
    return stack;
  } else {
    Zone.getStacktrace = getStacktraceWithCaughtError;
    return Zone.getStacktrace();
  }
};

Zone.longStackTraceZone = {
  getLongStacktrace: function (exception) {
    var trace = [];
    var zone = this;
    if (exception) {
      if (zone.stackFramesFilter) {
        trace.push(exception.stack.split('\n').
            filter(zone.stackFramesFilter).
            join('\n'));
      } else {
        trace.push(exception.stack);
      }
    }
    var now = Date.now();
    while (zone && zone.constructedAtException) {
      trace.push(
          '--- ' + (Date(zone.constructedAtTime)).toString() +
            ' - ' + (now - zone.constructedAtTime) + 'ms ago',
          zone.constructedAtException.get());
      zone = zone.parent;
    }
    return trace.join('\n');
  },

  stackFramesFilter: function (line) {
    return line.indexOf('zone.js') === -1;
  },

  onError: function (exception) {
    var reporter = this.reporter || console.log.bind(console);
    reporter(exception.toString());
    reporter(this.getLongStacktrace(exception));
  },

  '$fork': function (parentFork) {
    return function() {
      var newZone = parentFork.apply(this, arguments);
      newZone.constructedAtException = Zone.getStacktrace();
      newZone.constructedAtTime = Date.now();
      return newZone;
    }
  }
};


/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
"use strict";
var Reflect;
(function (Reflect) {
    // Load global or shim versions of Map, Set, and WeakMap
    var functionPrototype = Object.getPrototypeOf(Function);
    var _Map = typeof Map === "function" ? Map : CreateMapPolyfill();
    var _Set = typeof Set === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    // [[Metadata]] internal slot
    var __Metadata__ = new _WeakMap();
    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param targetKey (Optional) The property key to decorate.
      * @param targetDescriptor (Optional) The property descriptor for the target key
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     C = Reflect.decorate(decoratorsArray, C);
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, C, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, C.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(C, "staticMethod",
      *         Reflect.decorate(decoratorsArray, C, "staticMethod",
      *             Object.getOwnPropertyDescriptor(C, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(C.prototype, "method",
      *         Reflect.decorate(decoratorsArray, C.prototype, "method",
      *             Object.getOwnPropertyDescriptor(C.prototype, "method")));
      *
      */
    function decorate(decorators, target, targetKey, targetDescriptor) {
        if (!IsUndefined(targetDescriptor)) {
            if (!IsArray(decorators)) {
                throw new TypeError();
            }
            else if (!IsObject(target)) {
                throw new TypeError();
            }
            else if (IsUndefined(targetKey)) {
                throw new TypeError();
            }
            else if (!IsObject(targetDescriptor)) {
                throw new TypeError();
            }
            targetKey = ToPropertyKey(targetKey);
            return DecoratePropertyWithDescriptor(decorators, target, targetKey, targetDescriptor);
        }
        else if (!IsUndefined(targetKey)) {
            if (!IsArray(decorators)) {
                throw new TypeError();
            }
            else if (!IsObject(target)) {
                throw new TypeError();
            }
            targetKey = ToPropertyKey(targetKey);
            return DecoratePropertyWithoutDescriptor(decorators, target, targetKey);
        }
        else {
            if (!IsArray(decorators)) {
                throw new TypeError();
            }
            else if (!IsConstructor(target)) {
                throw new TypeError();
            }
            return DecorateConstructor(decorators, target);
        }
    }
    Reflect.decorate = decorate;
    /**
      * A default metadata decorator factory that can be used on a class, class member, or parameter.
      * @param metadataKey The key for the metadata entry.
      * @param metadataValue The value for the metadata entry.
      * @returns A decorator function.
      * @remarks
      * If `metadataKey` is already defined for the target and target key, the
      * metadataValue for that key will be overwritten.
      * @example
      *
      *     // constructor
      *     @Reflect.metadata(key, value)
      *     class C {
      *     }
      *
      *     // property (on constructor, TypeScript only)
      *     class C {
      *         @Reflect.metadata(key, value)
      *         static staticProperty;
      *     }
      *
      *     // property (on prototype, TypeScript only)
      *     class C {
      *         @Reflect.metadata(key, value)
      *         property;
      *     }
      *
      *     // method (on constructor)
      *     class C {
      *         @Reflect.metadata(key, value)
      *         static staticMethod() { }
      *     }
      *
      *     // method (on prototype)
      *     class C {
      *         @Reflect.metadata(key, value)
      *         method() { }
      *     }
      *
      */
    function metadata(metadataKey, metadataValue) {
        function decorator(target, targetKey) {
            if (!IsUndefined(targetKey)) {
                if (!IsObject(target)) {
                    throw new TypeError();
                }
                targetKey = ToPropertyKey(targetKey);
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
            }
            else {
                if (!IsConstructor(target)) {
                    throw new TypeError();
                }
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, undefined);
            }
        }
        return decorator;
    }
    Reflect.metadata = metadata;
    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param targetKey (Optional) The property key for the target.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, C);
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, C, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, C.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, C, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, C.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): Decorator {
      *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    function defineMetadata(metadataKey, metadataValue, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
    }
    Reflect.defineMetadata = defineMetadata;
    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", C);
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", C.prototype, "method");
      *
      */
    function hasMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryHasMetadata(metadataKey, target, targetKey);
    }
    Reflect.hasMetadata = hasMetadata;
    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", C);
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", C.prototype, "method");
      *
      */
    function hasOwnMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryHasOwnMetadata(metadataKey, target, targetKey);
    }
    Reflect.hasOwnMetadata = hasOwnMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", C);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", C.prototype, "method");
      *
      */
    function getMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryGetMetadata(metadataKey, target, targetKey);
    }
    Reflect.getMetadata = getMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", C);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", C.prototype, "method");
      *
      */
    function getOwnMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryGetOwnMetadata(metadataKey, target, targetKey);
    }
    Reflect.getOwnMetadata = getOwnMetadata;
    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(C);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(C.prototype, "method");
      *
      */
    function getMetadataKeys(target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryMetadataKeys(target, targetKey);
    }
    Reflect.getMetadataKeys = getMetadataKeys;
    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(C);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(C.prototype, "method");
      *
      */
    function getOwnMetadataKeys(target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        return OrdinaryOwnMetadataKeys(target, targetKey);
    }
    Reflect.getOwnMetadataKeys = getOwnMetadataKeys;
    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class C {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", C);
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", C, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", C.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", C, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", C.prototype, "method");
      *
      */
    function deleteMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (!IsUndefined(targetKey)) {
            targetKey = ToPropertyKey(targetKey);
        }
        // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#deletemetadata-metadatakey-p-
        var metadataMap = GetOrCreateMetadataMap(target, targetKey, false);
        if (IsUndefined(metadataMap)) {
            return false;
        }
        if (!metadataMap.delete(metadataKey)) {
            return false;
        }
        if (metadataMap.size > 0) {
            return true;
        }
        var targetMetadata = __Metadata__.get(target);
        targetMetadata.delete(targetKey);
        if (targetMetadata.size > 0) {
            return true;
        }
        __Metadata__.delete(target);
        return true;
    }
    Reflect.deleteMetadata = deleteMetadata;
    function DecorateConstructor(decorators, target) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated)) {
                if (!IsConstructor(decorated)) {
                    throw new TypeError();
                }
                target = decorated;
            }
        }
        return target;
    }
    function DecoratePropertyWithDescriptor(decorators, target, propertyKey, descriptor) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated)) {
                if (!IsObject(decorated)) {
                    throw new TypeError();
                }
                descriptor = decorated;
            }
        }
        return descriptor;
    }
    function DecoratePropertyWithoutDescriptor(decorators, target, propertyKey) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            decorator(target, propertyKey);
        }
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#getorcreatemetadatamap--o-p-create-
    function GetOrCreateMetadataMap(target, targetKey, create) {
        var targetMetadata = __Metadata__.get(target);
        if (!targetMetadata) {
            if (!create) {
                return undefined;
            }
            targetMetadata = new _Map();
            __Metadata__.set(target, targetMetadata);
        }
        var keyMetadata = targetMetadata.get(targetKey);
        if (!keyMetadata) {
            if (!create) {
                return undefined;
            }
            keyMetadata = new _Map();
            targetMetadata.set(targetKey, keyMetadata);
        }
        return keyMetadata;
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryhasmetadata--metadatakey-o-p-
    function OrdinaryHasMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) {
            return true;
        }
        var parent = GetPrototypeOf(O);
        if (parent !== null) {
            return OrdinaryHasMetadata(MetadataKey, parent, P);
        }
        return false;
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryhasownmetadata--metadatakey-o-p-
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, false);
        if (metadataMap === undefined) {
            return false;
        }
        return Boolean(metadataMap.has(MetadataKey));
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarygetmetadata--metadatakey-o-p-
    function OrdinaryGetMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn) {
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        var parent = GetPrototypeOf(O);
        if (parent !== null) {
            return OrdinaryGetMetadata(MetadataKey, parent, P);
        }
        return undefined;
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarygetownmetadata--metadatakey-o-p-
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, false);
        if (metadataMap === undefined) {
            return undefined;
        }
        return metadataMap.get(MetadataKey);
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarydefineownmetadata--metadatakey-metadatavalue-o-p-
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarymetadatakeys--o-p-
    function OrdinaryMetadataKeys(O, P) {
        var ownKeys = OrdinaryOwnMetadataKeys(O, P);
        var parent = GetPrototypeOf(O);
        if (parent === null) {
            return ownKeys;
        }
        var parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0) {
            return ownKeys;
        }
        if (ownKeys.length <= 0) {
            return parentKeys;
        }
        var set = new _Set();
        var keys = [];
        for (var _i = 0; _i < ownKeys.length; _i++) {
            var key = ownKeys[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        for (var _a = 0; _a < parentKeys.length; _a++) {
            var key = parentKeys[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        return keys;
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryownmetadatakeys--o-p-
    function OrdinaryOwnMetadataKeys(target, targetKey) {
        var metadataMap = GetOrCreateMetadataMap(target, targetKey, false);
        var keys = [];
        if (metadataMap) {
            metadataMap.forEach(function (_, key) { return keys.push(key); });
        }
        return keys;
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-undefined-type
    function IsUndefined(x) {
        return x === undefined;
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
    function IsArray(x) {
        return Array.isArray(x);
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-type
    function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
    function IsConstructor(x) {
        return typeof x === "function";
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-symbol-type
    function IsSymbol(x) {
        return typeof x === "symbol";
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
    function ToPropertyKey(value) {
        if (IsSymbol(value)) {
            return value;
        }
        return String(value);
    }
    function GetPrototypeOf(O) {
        var proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype) {
            return proto;
        }
        // TypeScript doesn't set __proto__ in ES5, as it's non-standard. 
        // Try to determine the superclass constructor. Compatible implementations
        // must either set __proto__ on a subclass constructor to the superclass constructor,
        // or ensure each class has a valid `constructor` property on its prototype that
        // points back to the constructor.
        // If this is not the same as Function.[[Prototype]], then this is definately inherited.
        // This is the case when in ES6 or when using __proto__ in a compatible browser.
        if (proto !== functionPrototype) {
            return proto;
        }
        // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
        var prototype = O.prototype;
        var prototypeProto = Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype) {
            return proto;
        }
        // if the constructor was not a function, then we cannot determine the heritage.
        var constructor = prototypeProto.constructor;
        if (typeof constructor !== "function") {
            return proto;
        }
        // if we have some kind of self-reference, then we cannot determine the heritage.
        if (constructor === O) {
            return proto;
        }
        // we have a pretty good guess at the heritage.
        return constructor;
    }
    // naive Map shim
    function CreateMapPolyfill() {
        var cacheSentinel = {};
        function Map() {
            this._keys = [];
            this._values = [];
            this._cache = cacheSentinel;
        }
        Map.prototype = {
            get size() {
                return this._keys.length;
            },
            has: function (key) {
                if (key === this._cache) {
                    return true;
                }
                if (this._find(key) >= 0) {
                    this._cache = key;
                    return true;
                }
                return false;
            },
            get: function (key) {
                var index = this._find(key);
                if (index >= 0) {
                    this._cache = key;
                    return this._values[index];
                }
                return undefined;
            },
            set: function (key, value) {
                this.delete(key);
                this._keys.push(key);
                this._values.push(value);
                this._cache = key;
                return this;
            },
            delete: function (key) {
                var index = this._find(key);
                if (index >= 0) {
                    this._keys.splice(index, 1);
                    this._values.splice(index, 1);
                    this._cache = cacheSentinel;
                    return true;
                }
                return false;
            },
            clear: function () {
                this._keys.length = 0;
                this._values.length = 0;
                this._cache = cacheSentinel;
            },
            forEach: function (callback, thisArg) {
                var size = this.size;
                for (var i = 0; i < size; ++i) {
                    var key = this._keys[i];
                    var value = this._values[i];
                    this._cache = key;
                    callback.call(this, value, key, this);
                }
            },
            _find: function (key) {
                var keys = this._keys;
                var size = keys.length;
                for (var i = 0; i < size; ++i) {
                    if (keys[i] === key) {
                        return i;
                    }
                }
                return -1;
            }
        };
        return Map;
    }
    // naive Set shim
    function CreateSetPolyfill() {
        var cacheSentinel = {};
        function Set() {
            this._map = new _Map();
        }
        Set.prototype = {
            get size() {
                return this._map.length;
            },
            has: function (value) {
                return this._map.has(value);
            },
            add: function (value) {
                this._map.set(value, value);
                return this;
            },
            delete: function (value) {
                return this._map.delete(value);
            },
            clear: function () {
                this._map.clear();
            },
            forEach: function (callback, thisArg) {
                this._map.forEach(callback, thisArg);
            }
        };
        return Set;
    }
    // naive WeakMap shim
    function CreateWeakMapPolyfill() {
        var UUID_SIZE = 16;
        var isNode = typeof global !== "undefined" &&
            typeof module === "object" &&
            typeof module.exports === "object" &&
            typeof require === "function";
        var nodeCrypto = isNode && require("crypto");
        var hasOwn = Object.prototype.hasOwnProperty;
        var keys = {};
        var rootKey = CreateUniqueKey();
        function WeakMap() {
            this._key = CreateUniqueKey();
        }
        WeakMap.prototype = {
            has: function (target) {
                var table = GetOrCreateWeakMapTable(target, false);
                if (table) {
                    return this._key in table;
                }
                return false;
            },
            get: function (target) {
                var table = GetOrCreateWeakMapTable(target, false);
                if (table) {
                    return table[this._key];
                }
                return undefined;
            },
            set: function (target, value) {
                var table = GetOrCreateWeakMapTable(target, true);
                table[this._key] = value;
                return this;
            },
            delete: function (target) {
                var table = GetOrCreateWeakMapTable(target, false);
                if (table && this._key in table) {
                    return delete table[this._key];
                }
                return false;
            },
            clear: function () {
                // NOTE: not a real clear, just makes the previous data unreachable
                this._key = CreateUniqueKey();
            }
        };
        function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i) {
                buffer[i] = Math.random() * 255 | 0;
            }
        }
        function GenRandomBytes(size) {
            if (nodeCrypto) {
                var data = nodeCrypto.randomBytes(size);
                return data;
            }
            else if (typeof Uint8Array === "function") {
                var data = new Uint8Array(size);
                if (typeof crypto !== "undefined") {
                    crypto.getRandomValues(data);
                }
                else if (typeof msCrypto !== "undefined") {
                    msCrypto.getRandomValues(data);
                }
                else {
                    FillRandomBytes(data, size);
                }
                return data;
            }
            else {
                var data = new Array(size);
                FillRandomBytes(data, size);
                return data;
            }
        }
        function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            // mark as random - RFC 4122 § 4.4
            data[6] = data[6] & 0x4f | 0x40;
            data[8] = data[8] & 0xbf | 0x80;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
                var byte = data[offset];
                if (offset === 4 || offset === 6 || offset === 8) {
                    result += "-";
                }
                if (byte < 16) {
                    result += "0";
                }
                result += byte.toString(16).toLowerCase();
            }
            return result;
        }
        function CreateUniqueKey() {
            var key;
            do {
                key = "@@WeakMap@@" + CreateUUID();
            } while (hasOwn.call(keys, key));
            keys[key] = true;
            return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
                if (!create) {
                    return undefined;
                }
                Object.defineProperty(target, rootKey, { value: Object.create(null) });
            }
            return target[rootKey];
        }
        return WeakMap;
    }
    // hook global Reflect
    (function (__global) {
        if (typeof __global.Reflect !== "undefined") {
            if (__global.Reflect !== Reflect) {
                for (var p in Reflect) {
                    __global.Reflect[p] = Reflect[p];
                }
            }
        }
        else {
            __global.Reflect = Reflect;
        }
    })(typeof window !== "undefined" ? window :
        typeof WorkerGlobalScope !== "undefined" ? self :
            typeof global !== "undefined" ? global :
                Function("return this;")());
})(Reflect || (Reflect = {}));
//# sourceMappingURLDisabled=Reflect.js.map
"format register";
System.register("rx", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  ;
  (function(undefined) {
    var objectTypes = {
      'boolean': false,
      'function': true,
      'object': true,
      'number': false,
      'string': false,
      'undefined': false
    };
    var root = (objectTypes[typeof window] && window) || this,
        freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
      root = freeGlobal;
    }
    var Rx = {
      internals: {},
      config: {Promise: root.Promise},
      helpers: {}
    };
    var noop = Rx.helpers.noop = function() {},
        notDefined = Rx.helpers.notDefined = function(x) {
          return typeof x === 'undefined';
        },
        isScheduler = Rx.helpers.isScheduler = function(x) {
          return x instanceof Rx.Scheduler;
        },
        identity = Rx.helpers.identity = function(x) {
          return x;
        },
        pluck = Rx.helpers.pluck = function(property) {
          return function(x) {
            return x[property];
          };
        },
        just = Rx.helpers.just = function(value) {
          return function() {
            return value;
          };
        },
        defaultNow = Rx.helpers.defaultNow = Date.now,
        defaultComparer = Rx.helpers.defaultComparer = function(x, y) {
          return isEqual(x, y);
        },
        defaultSubComparer = Rx.helpers.defaultSubComparer = function(x, y) {
          return x > y ? 1 : (x < y ? -1 : 0);
        },
        defaultKeySerializer = Rx.helpers.defaultKeySerializer = function(x) {
          return x.toString();
        },
        defaultError = Rx.helpers.defaultError = function(err) {
          throw err;
        },
        isPromise = Rx.helpers.isPromise = function(p) {
          return !!p && typeof p.then === 'function';
        },
        asArray = Rx.helpers.asArray = function() {
          return Array.prototype.slice.call(arguments);
        },
        not = Rx.helpers.not = function(a) {
          return !a;
        },
        isFunction = Rx.helpers.isFunction = (function() {
          var isFn = function(value) {
            return typeof value == 'function' || false;
          };
          if (isFn(/x/)) {
            isFn = function(value) {
              return typeof value == 'function' && toString.call(value) == '[object Function]';
            };
          }
          return isFn;
        }());
    function cloneArray(arr) {
      for (var a = [],
          i = 0,
          len = arr.length; i < len; i++) {
        a.push(arr[i]);
      }
      return a;
    }
    Rx.config.longStackSupport = false;
    var hasStacks = false;
    try {
      throw new Error();
    } catch (e) {
      hasStacks = !!e.stack;
    }
    var rStartingLine = captureLine(),
        rFileName;
    var STACK_JUMP_SEPARATOR = "From previous event:";
    function makeStackTraceLong(error, observable) {
      if (hasStacks && observable.stack && typeof error === "object" && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);
        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
      }
    }
    function filterStackString(stackString) {
      var lines = stackString.split("\n"),
          desiredLines = [];
      for (var i = 0,
          len = lines.length; i < len; i++) {
        var line = lines[i];
        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
          desiredLines.push(line);
        }
      }
      return desiredLines.join("\n");
    }
    function isInternalFrame(stackLine) {
      var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
      if (!fileNameAndLineNumber) {
        return false;
      }
      var fileName = fileNameAndLineNumber[0],
          lineNumber = fileNameAndLineNumber[1];
      return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;
    }
    function isNodeFrame(stackLine) {
      return stackLine.indexOf("(module.js:") !== -1 || stackLine.indexOf("(node.js:") !== -1;
    }
    function captureLine() {
      if (!hasStacks) {
        return ;
      }
      try {
        throw new Error();
      } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
          return ;
        }
        rFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
      }
    }
    function getFileNameAndLineNumber(stackLine) {
      var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
      if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
      }
      var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
      if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
      }
      var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
      if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
      }
    }
    var EmptyError = Rx.EmptyError = function() {
      this.message = 'Sequence contains no elements.';
      Error.call(this);
    };
    EmptyError.prototype = Error.prototype;
    var ObjectDisposedError = Rx.ObjectDisposedError = function() {
      this.message = 'Object has been disposed';
      Error.call(this);
    };
    ObjectDisposedError.prototype = Error.prototype;
    var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function() {
      this.message = 'Argument out of range';
      Error.call(this);
    };
    ArgumentOutOfRangeError.prototype = Error.prototype;
    var NotSupportedError = Rx.NotSupportedError = function(message) {
      this.message = message || 'This operation is not supported';
      Error.call(this);
    };
    NotSupportedError.prototype = Error.prototype;
    var NotImplementedError = Rx.NotImplementedError = function(message) {
      this.message = message || 'This operation is not implemented';
      Error.call(this);
    };
    NotImplementedError.prototype = Error.prototype;
    var notImplemented = Rx.helpers.notImplemented = function() {
      throw new NotImplementedError();
    };
    var notSupported = Rx.helpers.notSupported = function() {
      throw new NotSupportedError();
    };
    var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';
    if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
      $iterator$ = '@@iterator';
    }
    var doneEnumerator = Rx.doneEnumerator = {
      done: true,
      value: undefined
    };
    var isIterable = Rx.helpers.isIterable = function(o) {
      return o[$iterator$] !== undefined;
    };
    var isArrayLike = Rx.helpers.isArrayLike = function(o) {
      return o && o.length !== undefined;
    };
    Rx.helpers.iterator = $iterator$;
    var bindCallback = Rx.internals.bindCallback = function(func, thisArg, argCount) {
      if (typeof thisArg === 'undefined') {
        return func;
      }
      switch (argCount) {
        case 0:
          return function() {
            return func.call(thisArg);
          };
        case 1:
          return function(arg) {
            return func.call(thisArg, arg);
          };
        case 2:
          return function(value, index) {
            return func.call(thisArg, value, index);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
          };
      }
      return function() {
        return func.apply(thisArg, arguments);
      };
    };
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;
    var argsClass = '[object Arguments]',
        arrayClass = '[object Array]',
        boolClass = '[object Boolean]',
        dateClass = '[object Date]',
        errorClass = '[object Error]',
        funcClass = '[object Function]',
        numberClass = '[object Number]',
        objectClass = '[object Object]',
        regexpClass = '[object RegExp]',
        stringClass = '[object String]';
    var toString = Object.prototype.toString,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        supportsArgsClass = toString.call(arguments) == argsClass,
        supportNodeClass,
        errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype,
        propertyIsEnumerable = objectProto.propertyIsEnumerable;
    try {
      supportNodeClass = !(toString.call(document) == objectClass && !({'toString': 0} + ''));
    } catch (e) {
      supportNodeClass = true;
    }
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
      'constructor': true,
      'toLocaleString': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
      'constructor': true,
      'toString': true,
      'valueOf': true
    };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
      'constructor': true,
      'toString': true
    };
    nonEnumProps[objectClass] = {'constructor': true};
    var support = {};
    (function() {
      var ctor = function() {
        this.x = 1;
      },
          props = [];
      ctor.prototype = {
        'valueOf': 1,
        'y': 1
      };
      for (var key in new ctor) {
        props.push(key);
      }
      for (key in arguments) {}
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');
      support.nonEnumArgs = key != 0;
      support.nonEnumShadows = !/valueOf/.test(props);
    }(1));
    var isObject = Rx.internals.isObject = function(value) {
      var type = typeof value;
      return value && (type == 'function' || type == 'object') || false;
    };
    function keysIn(object) {
      var result = [];
      if (!isObject(object)) {
        return result;
      }
      if (support.nonEnumArgs && object.length && isArguments(object)) {
        object = slice.call(object);
      }
      var skipProto = support.enumPrototypes && typeof object == 'function',
          skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);
      for (var key in object) {
        if (!(skipProto && key == 'prototype') && !(skipErrorProps && (key == 'message' || key == 'name'))) {
          result.push(key);
        }
      }
      if (support.nonEnumShadows && object !== objectProto) {
        var ctor = object.constructor,
            index = -1,
            length = dontEnumsLength;
        if (object === (ctor && ctor.prototype)) {
          var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
              nonEnum = nonEnumProps[className];
        }
        while (++index < length) {
          key = dontEnums[index];
          if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
            result.push(key);
          }
        }
      }
      return result;
    }
    function internalFor(object, callback, keysFunc) {
      var index = -1,
          props = keysFunc(object),
          length = props.length;
      while (++index < length) {
        var key = props[index];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }
    function internalForIn(object, callback) {
      return internalFor(object, callback, keysIn);
    }
    function isNode(value) {
      return typeof value.toString != 'function' && typeof(value + '') == 'string';
    }
    var isArguments = function(value) {
      return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
    };
    if (!supportsArgsClass) {
      isArguments = function(value) {
        return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
      };
    }
    var isEqual = Rx.internals.isEqual = function(x, y) {
      return deepEquals(x, y, [], []);
    };
    function deepEquals(a, b, stackA, stackB) {
      if (a === b) {
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;
      if (a === a && (a == null || b == null || (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      var className = toString.call(a),
          otherClass = toString.call(b);
      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          return +a == +b;
        case numberClass:
          return (a != +a) ? b != +b : (a == 0 ? (1 / a == 1 / b) : a == +b);
        case regexpClass:
        case stringClass:
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
        if (ctorA != ctorB && !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      var initedStack = !stackA;
      stackA || (stackA = []);
      stackB || (stackB = []);
      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      var result = true;
      stackA.push(a);
      stackB.push(b);
      if (isArr) {
        length = a.length;
        size = b.length;
        result = size == length;
        if (result) {
          while (size--) {
            var index = length,
                value = b[size];
            if (!(result = deepEquals(a[size], value, stackA, stackB))) {
              break;
            }
          }
        }
      } else {
        internalForIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            size++;
            return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
          }
        });
        if (result) {
          internalForIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();
      return result;
    }
    var hasProp = {}.hasOwnProperty,
        slice = Array.prototype.slice;
    var inherits = this.inherits = Rx.internals.inherits = function(child, parent) {
      function __() {
        this.constructor = child;
      }
      __.prototype = parent.prototype;
      child.prototype = new __();
    };
    var addProperties = Rx.internals.addProperties = function(obj) {
      for (var sources = [],
          i = 1,
          len = arguments.length; i < len; i++) {
        sources.push(arguments[i]);
      }
      for (var idx = 0,
          ln = sources.length; idx < ln; idx++) {
        var source = sources[idx];
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    };
    var addRef = Rx.internals.addRef = function(xs, r) {
      return new AnonymousObservable(function(observer) {
        return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
      });
    };
    function arrayInitialize(count, factory) {
      var a = new Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = factory();
      }
      return a;
    }
    var errorObj = {e: {}};
    var tryCatchTarget;
    function tryCatcher() {
      try {
        return tryCatchTarget.apply(this, arguments);
      } catch (e) {
        errorObj.e = e;
        return errorObj;
      }
    }
    function tryCatch(fn) {
      if (!isFunction(fn)) {
        throw new TypeError('fn must be a function');
      }
      tryCatchTarget = fn;
      return tryCatcher;
    }
    function thrower(e) {
      throw e;
    }
    function IndexedItem(id, value) {
      this.id = id;
      this.value = value;
    }
    IndexedItem.prototype.compareTo = function(other) {
      var c = this.value.compareTo(other.value);
      c === 0 && (c = this.id - other.id);
      return c;
    };
    var PriorityQueue = Rx.internals.PriorityQueue = function(capacity) {
      this.items = new Array(capacity);
      this.length = 0;
    };
    var priorityProto = PriorityQueue.prototype;
    priorityProto.isHigherPriority = function(left, right) {
      return this.items[left].compareTo(this.items[right]) < 0;
    };
    priorityProto.percolate = function(index) {
      if (index >= this.length || index < 0) {
        return ;
      }
      var parent = index - 1 >> 1;
      if (parent < 0 || parent === index) {
        return ;
      }
      if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
      }
    };
    priorityProto.heapify = function(index) {
      +index || (index = 0);
      if (index >= this.length || index < 0) {
        return ;
      }
      var left = 2 * index + 1,
          right = 2 * index + 2,
          first = index;
      if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
      }
      if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
      }
      if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
      }
    };
    priorityProto.peek = function() {
      return this.items[0].value;
    };
    priorityProto.removeAt = function(index) {
      this.items[index] = this.items[--this.length];
      this.items[this.length] = undefined;
      this.heapify();
    };
    priorityProto.dequeue = function() {
      var result = this.peek();
      this.removeAt(0);
      return result;
    };
    priorityProto.enqueue = function(item) {
      var index = this.length++;
      this.items[index] = new IndexedItem(PriorityQueue.count++, item);
      this.percolate(index);
    };
    priorityProto.remove = function(item) {
      for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
          this.removeAt(i);
          return true;
        }
      }
      return false;
    };
    PriorityQueue.count = 0;
    var CompositeDisposable = Rx.CompositeDisposable = function() {
      var args = [],
          i,
          len;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
        len = args.length;
      } else {
        len = arguments.length;
        args = new Array(len);
        for (i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      for (i = 0; i < len; i++) {
        if (!isDisposable(args[i])) {
          throw new TypeError('Not a disposable');
        }
      }
      this.disposables = args;
      this.isDisposed = false;
      this.length = args.length;
    };
    var CompositeDisposablePrototype = CompositeDisposable.prototype;
    CompositeDisposablePrototype.add = function(item) {
      if (this.isDisposed) {
        item.dispose();
      } else {
        this.disposables.push(item);
        this.length++;
      }
    };
    CompositeDisposablePrototype.remove = function(item) {
      var shouldDispose = false;
      if (!this.isDisposed) {
        var idx = this.disposables.indexOf(item);
        if (idx !== -1) {
          shouldDispose = true;
          this.disposables.splice(idx, 1);
          this.length--;
          item.dispose();
        }
      }
      return shouldDispose;
    };
    CompositeDisposablePrototype.dispose = function() {
      if (!this.isDisposed) {
        this.isDisposed = true;
        var len = this.disposables.length,
            currentDisposables = new Array(len);
        for (var i = 0; i < len; i++) {
          currentDisposables[i] = this.disposables[i];
        }
        this.disposables = [];
        this.length = 0;
        for (i = 0; i < len; i++) {
          currentDisposables[i].dispose();
        }
      }
    };
    var Disposable = Rx.Disposable = function(action) {
      this.isDisposed = false;
      this.action = action || noop;
    };
    Disposable.prototype.dispose = function() {
      if (!this.isDisposed) {
        this.action();
        this.isDisposed = true;
      }
    };
    var disposableCreate = Disposable.create = function(action) {
      return new Disposable(action);
    };
    var disposableEmpty = Disposable.empty = {dispose: noop};
    var isDisposable = Disposable.isDisposable = function(d) {
      return d && isFunction(d.dispose);
    };
    var checkDisposed = Disposable.checkDisposed = function(disposable) {
      if (disposable.isDisposed) {
        throw new ObjectDisposedError();
      }
    };
    var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = (function() {
      function BooleanDisposable() {
        this.isDisposed = false;
        this.current = null;
      }
      var booleanDisposablePrototype = BooleanDisposable.prototype;
      booleanDisposablePrototype.getDisposable = function() {
        return this.current;
      };
      booleanDisposablePrototype.setDisposable = function(value) {
        var shouldDispose = this.isDisposed;
        if (!shouldDispose) {
          var old = this.current;
          this.current = value;
        }
        old && old.dispose();
        shouldDispose && value && value.dispose();
      };
      booleanDisposablePrototype.dispose = function() {
        if (!this.isDisposed) {
          this.isDisposed = true;
          var old = this.current;
          this.current = null;
        }
        old && old.dispose();
      };
      return BooleanDisposable;
    }());
    var SerialDisposable = Rx.SerialDisposable = SingleAssignmentDisposable;
    var RefCountDisposable = Rx.RefCountDisposable = (function() {
      function InnerDisposable(disposable) {
        this.disposable = disposable;
        this.disposable.count++;
        this.isInnerDisposed = false;
      }
      InnerDisposable.prototype.dispose = function() {
        if (!this.disposable.isDisposed && !this.isInnerDisposed) {
          this.isInnerDisposed = true;
          this.disposable.count--;
          if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
            this.disposable.isDisposed = true;
            this.disposable.underlyingDisposable.dispose();
          }
        }
      };
      function RefCountDisposable(disposable) {
        this.underlyingDisposable = disposable;
        this.isDisposed = false;
        this.isPrimaryDisposed = false;
        this.count = 0;
      }
      RefCountDisposable.prototype.dispose = function() {
        if (!this.isDisposed && !this.isPrimaryDisposed) {
          this.isPrimaryDisposed = true;
          if (this.count === 0) {
            this.isDisposed = true;
            this.underlyingDisposable.dispose();
          }
        }
      };
      RefCountDisposable.prototype.getDisposable = function() {
        return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
      };
      return RefCountDisposable;
    })();
    function ScheduledDisposable(scheduler, disposable) {
      this.scheduler = scheduler;
      this.disposable = disposable;
      this.isDisposed = false;
    }
    function scheduleItem(s, self) {
      if (!self.isDisposed) {
        self.isDisposed = true;
        self.disposable.dispose();
      }
    }
    ScheduledDisposable.prototype.dispose = function() {
      this.scheduler.scheduleWithState(this, scheduleItem);
    };
    var ScheduledItem = Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer) {
      this.scheduler = scheduler;
      this.state = state;
      this.action = action;
      this.dueTime = dueTime;
      this.comparer = comparer || defaultSubComparer;
      this.disposable = new SingleAssignmentDisposable();
    };
    ScheduledItem.prototype.invoke = function() {
      this.disposable.setDisposable(this.invokeCore());
    };
    ScheduledItem.prototype.compareTo = function(other) {
      return this.comparer(this.dueTime, other.dueTime);
    };
    ScheduledItem.prototype.isCancelled = function() {
      return this.disposable.isDisposed;
    };
    ScheduledItem.prototype.invokeCore = function() {
      return this.action(this.scheduler, this.state);
    };
    var Scheduler = Rx.Scheduler = (function() {
      function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
        this.now = now;
        this._schedule = schedule;
        this._scheduleRelative = scheduleRelative;
        this._scheduleAbsolute = scheduleAbsolute;
      }
      function invokeAction(scheduler, action) {
        action();
        return disposableEmpty;
      }
      var schedulerProto = Scheduler.prototype;
      schedulerProto.schedule = function(action) {
        return this._schedule(action, invokeAction);
      };
      schedulerProto.scheduleWithState = function(state, action) {
        return this._schedule(state, action);
      };
      schedulerProto.scheduleWithRelative = function(dueTime, action) {
        return this._scheduleRelative(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative(state, dueTime, action);
      };
      schedulerProto.scheduleWithAbsolute = function(dueTime, action) {
        return this._scheduleAbsolute(action, dueTime, invokeAction);
      };
      schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute(state, dueTime, action);
      };
      Scheduler.now = defaultNow;
      Scheduler.normalize = function(timeSpan) {
        timeSpan < 0 && (timeSpan = 0);
        return timeSpan;
      };
      return Scheduler;
    }());
    var normalizeTime = Scheduler.normalize;
    (function(schedulerProto) {
      function invokeRecImmediate(scheduler, pair) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2) {
            var isAdded = false,
                isDone = false,
                d = scheduler.scheduleWithState(state2, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        recursiveAction(state);
        return group;
      }
      function invokeRecDate(scheduler, pair, method) {
        var state = pair[0],
            action = pair[1],
            group = new CompositeDisposable();
        function recursiveAction(state1) {
          action(state1, function(state2, dueTime1) {
            var isAdded = false,
                isDone = false,
                d = scheduler[method](state2, dueTime1, function(scheduler1, state3) {
                  if (isAdded) {
                    group.remove(d);
                  } else {
                    isDone = true;
                  }
                  recursiveAction(state3);
                  return disposableEmpty;
                });
            if (!isDone) {
              group.add(d);
              isAdded = true;
            }
          });
        }
        ;
        recursiveAction(state);
        return group;
      }
      function scheduleInnerRecursive(action, self) {
        action(function(dt) {
          self(action, dt);
        });
      }
      schedulerProto.scheduleRecursive = function(action) {
        return this.scheduleRecursiveWithState(action, function(_action, self) {
          _action(function() {
            self(_action);
          });
        });
      };
      schedulerProto.scheduleRecursiveWithState = function(state, action) {
        return this.scheduleWithState([state, action], invokeRecImmediate);
      };
      schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action) {
        return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action) {
        return this._scheduleRelative([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
        });
      };
      schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action) {
        return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
      };
      schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action) {
        return this._scheduleAbsolute([state, action], dueTime, function(s, p) {
          return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      Scheduler.prototype.schedulePeriodic = function(period, action) {
        return this.schedulePeriodicWithState(null, period, action);
      };
      Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        if (typeof root.setInterval === 'undefined') {
          throw new NotSupportedError();
        }
        period = normalizeTime(period);
        var s = state,
            id = root.setInterval(function() {
              s = action(s);
            }, period);
        return disposableCreate(function() {
          root.clearInterval(id);
        });
      };
    }(Scheduler.prototype));
    (function(schedulerProto) {
      schedulerProto.catchError = schedulerProto['catch'] = function(handler) {
        return new CatchScheduler(this, handler);
      };
    }(Scheduler.prototype));
    var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function() {
      function tick(command, recurse) {
        recurse(0, this._period);
        try {
          this._state = this._action(this._state);
        } catch (e) {
          this._cancel.dispose();
          throw e;
        }
      }
      function SchedulePeriodicRecursive(scheduler, state, period, action) {
        this._scheduler = scheduler;
        this._state = state;
        this._period = period;
        this._action = action;
      }
      SchedulePeriodicRecursive.prototype.start = function() {
        var d = new SingleAssignmentDisposable();
        this._cancel = d;
        d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));
        return d;
      };
      return SchedulePeriodicRecursive;
    }());
    var immediateScheduler = Scheduler.immediate = (function() {
      function scheduleNow(state, action) {
        return action(this, state);
      }
      return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    }());
    var currentThreadScheduler = Scheduler.currentThread = (function() {
      var queue;
      function runTrampoline() {
        while (queue.length > 0) {
          var item = queue.dequeue();
          !item.isCancelled() && item.invoke();
        }
      }
      function scheduleNow(state, action) {
        var si = new ScheduledItem(this, state, action, this.now());
        if (!queue) {
          queue = new PriorityQueue(4);
          queue.enqueue(si);
          var result = tryCatch(runTrampoline)();
          queue = null;
          if (result === errorObj) {
            return thrower(result.e);
          }
        } else {
          queue.enqueue(si);
        }
        return si.disposable;
      }
      var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
      currentScheduler.scheduleRequired = function() {
        return !queue;
      };
      return currentScheduler;
    }());
    var scheduleMethod,
        clearMethod;
    var localTimer = (function() {
      var localSetTimeout,
          localClearTimeout = noop;
      if (!!root.WScript) {
        localSetTimeout = function(fn, time) {
          root.WScript.Sleep(time);
          fn();
        };
      } else if (!!root.setTimeout) {
        localSetTimeout = root.setTimeout;
        localClearTimeout = root.clearTimeout;
      } else {
        throw new NotSupportedError();
      }
      return {
        setTimeout: localSetTimeout,
        clearTimeout: localClearTimeout
      };
    }());
    var localSetTimeout = localTimer.setTimeout,
        localClearTimeout = localTimer.clearTimeout;
    (function() {
      var nextHandle = 1,
          tasksByHandle = {},
          currentlyRunning = false;
      clearMethod = function(handle) {
        delete tasksByHandle[handle];
      };
      function runTask(handle) {
        if (currentlyRunning) {
          localSetTimeout(function() {
            runTask(handle);
          }, 0);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunning = true;
            var result = tryCatch(task)();
            clearMethod(handle);
            currentlyRunning = false;
            if (result === errorObj) {
              return thrower(result.e);
            }
          }
        }
      }
      var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
      var setImmediate = typeof(setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
      function postMessageSupported() {
        if (!root.postMessage || root.importScripts) {
          return false;
        }
        var isAsync = false,
            oldHandler = root.onmessage;
        root.onmessage = function() {
          isAsync = true;
        };
        root.postMessage('', '*');
        root.onmessage = oldHandler;
        return isAsync;
      }
      if (isFunction(setImmediate)) {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          setImmediate(function() {
            runTask(id);
          });
          return id;
        };
      } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          process.nextTick(function() {
            runTask(id);
          });
          return id;
        };
      } else if (postMessageSupported()) {
        var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
        function onGlobalPostMessage(event) {
          if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
            runTask(event.data.substring(MSG_PREFIX.length));
          }
        }
        if (root.addEventListener) {
          root.addEventListener('message', onGlobalPostMessage, false);
        } else {
          root.attachEvent('onmessage', onGlobalPostMessage, false);
        }
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          root.postMessage(MSG_PREFIX + currentId, '*');
          return id;
        };
      } else if (!!root.MessageChannel) {
        var channel = new root.MessageChannel();
        channel.port1.onmessage = function(e) {
          runTask(e.data);
        };
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          channel.port2.postMessage(id);
          return id;
        };
      } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
        scheduleMethod = function(action) {
          var scriptElement = root.document.createElement('script');
          var id = nextHandle++;
          tasksByHandle[id] = action;
          scriptElement.onreadystatechange = function() {
            runTask(id);
            scriptElement.onreadystatechange = null;
            scriptElement.parentNode.removeChild(scriptElement);
            scriptElement = null;
          };
          root.document.documentElement.appendChild(scriptElement);
          return id;
        };
      } else {
        scheduleMethod = function(action) {
          var id = nextHandle++;
          tasksByHandle[id] = action;
          localSetTimeout(function() {
            runTask(id);
          }, 0);
          return id;
        };
      }
    }());
    var timeoutScheduler = Scheduler.timeout = Scheduler.default = (function() {
      function scheduleNow(state, action) {
        var scheduler = this,
            disposable = new SingleAssignmentDisposable();
        var id = scheduleMethod(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        });
        return new CompositeDisposable(disposable, disposableCreate(function() {
          clearMethod(id);
        }));
      }
      function scheduleRelative(state, dueTime, action) {
        var scheduler = this,
            dt = Scheduler.normalize(dueTime);
        if (dt === 0) {
          return scheduler.scheduleWithState(state, action);
        }
        var disposable = new SingleAssignmentDisposable();
        var id = localSetTimeout(function() {
          if (!disposable.isDisposed) {
            disposable.setDisposable(action(scheduler, state));
          }
        }, dt);
        return new CompositeDisposable(disposable, disposableCreate(function() {
          localClearTimeout(id);
        }));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
      }
      return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
    })();
    var CatchScheduler = (function(__super__) {
      function scheduleNow(state, action) {
        return this._scheduler.scheduleWithState(state, this._wrap(action));
      }
      function scheduleRelative(state, dueTime, action) {
        return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
      }
      function scheduleAbsolute(state, dueTime, action) {
        return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
      }
      inherits(CatchScheduler, __super__);
      function CatchScheduler(scheduler, handler) {
        this._scheduler = scheduler;
        this._handler = handler;
        this._recursiveOriginal = null;
        this._recursiveWrapper = null;
        __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
      }
      CatchScheduler.prototype._clone = function(scheduler) {
        return new CatchScheduler(scheduler, this._handler);
      };
      CatchScheduler.prototype._wrap = function(action) {
        var parent = this;
        return function(self, state) {
          try {
            return action(parent._getRecursiveWrapper(self), state);
          } catch (e) {
            if (!parent._handler(e)) {
              throw e;
            }
            return disposableEmpty;
          }
        };
      };
      CatchScheduler.prototype._getRecursiveWrapper = function(scheduler) {
        if (this._recursiveOriginal !== scheduler) {
          this._recursiveOriginal = scheduler;
          var wrapper = this._clone(scheduler);
          wrapper._recursiveOriginal = scheduler;
          wrapper._recursiveWrapper = wrapper;
          this._recursiveWrapper = wrapper;
        }
        return this._recursiveWrapper;
      };
      CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
        var self = this,
            failed = false,
            d = new SingleAssignmentDisposable();
        d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1) {
          if (failed) {
            return null;
          }
          try {
            return action(state1);
          } catch (e) {
            failed = true;
            if (!self._handler(e)) {
              throw e;
            }
            d.dispose();
            return null;
          }
        }));
        return d;
      };
      return CatchScheduler;
    }(Scheduler));
    var Notification = Rx.Notification = (function() {
      function Notification(kind, value, exception, accept, acceptObservable, toString) {
        this.kind = kind;
        this.value = value;
        this.exception = exception;
        this._accept = accept;
        this._acceptObservable = acceptObservable;
        this.toString = toString;
      }
      Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted) {
        return observerOrOnNext && typeof observerOrOnNext === 'object' ? this._acceptObservable(observerOrOnNext) : this._accept(observerOrOnNext, onError, onCompleted);
      };
      Notification.prototype.toObservable = function(scheduler) {
        var self = this;
        isScheduler(scheduler) || (scheduler = immediateScheduler);
        return new AnonymousObservable(function(observer) {
          return scheduler.scheduleWithState(self, function(_, notification) {
            notification._acceptObservable(observer);
            notification.kind === 'N' && observer.onCompleted();
          });
        });
      };
      return Notification;
    })();
    var notificationCreateOnNext = Notification.createOnNext = (function() {
      function _accept(onNext) {
        return onNext(this.value);
      }
      function _acceptObservable(observer) {
        return observer.onNext(this.value);
      }
      function toString() {
        return 'OnNext(' + this.value + ')';
      }
      return function(value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnError = Notification.createOnError = (function() {
      function _accept(onNext, onError) {
        return onError(this.exception);
      }
      function _acceptObservable(observer) {
        return observer.onError(this.exception);
      }
      function toString() {
        return 'OnError(' + this.exception + ')';
      }
      return function(e) {
        return new Notification('E', null, e, _accept, _acceptObservable, toString);
      };
    }());
    var notificationCreateOnCompleted = Notification.createOnCompleted = (function() {
      function _accept(onNext, onError, onCompleted) {
        return onCompleted();
      }
      function _acceptObservable(observer) {
        return observer.onCompleted();
      }
      function toString() {
        return 'OnCompleted()';
      }
      return function() {
        return new Notification('C', null, null, _accept, _acceptObservable, toString);
      };
    }());
    var Enumerator = Rx.internals.Enumerator = function(next) {
      this._next = next;
    };
    Enumerator.prototype.next = function() {
      return this._next();
    };
    Enumerator.prototype[$iterator$] = function() {
      return this;
    };
    var Enumerable = Rx.internals.Enumerable = function(iterator) {
      this._iterator = iterator;
    };
    Enumerable.prototype[$iterator$] = function() {
      return this._iterator();
    };
    Enumerable.prototype.concat = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            return o.onCompleted();
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(err) {
            o.onError(err);
          }, self));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchError = function() {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var e = sources[$iterator$]();
        var isDisposed,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function(lastException, self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return observer.onError(ex);
          }
          if (currentItem.done) {
            if (lastException !== null) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return ;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, self, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    Enumerable.prototype.catchErrorWhen = function(notificationHandler) {
      var sources = this;
      return new AnonymousObservable(function(o) {
        var exceptions = new Subject(),
            notifier = new Subject(),
            handled = notificationHandler(exceptions),
            notificationDisposable = handled.subscribe(notifier);
        var e = sources[$iterator$]();
        var isDisposed,
            lastException,
            subscription = new SerialDisposable();
        var cancelable = immediateScheduler.scheduleRecursive(function(self) {
          if (isDisposed) {
            return ;
          }
          try {
            var currentItem = e.next();
          } catch (ex) {
            return o.onError(ex);
          }
          if (currentItem.done) {
            if (lastException) {
              o.onError(lastException);
            } else {
              o.onCompleted();
            }
            return ;
          }
          var currentValue = currentItem.value;
          isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
          var outer = new SingleAssignmentDisposable();
          var inner = new SingleAssignmentDisposable();
          subscription.setDisposable(new CompositeDisposable(inner, outer));
          outer.setDisposable(currentValue.subscribe(function(x) {
            o.onNext(x);
          }, function(exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));
            exceptions.onNext(exn);
          }, function() {
            o.onCompleted();
          }));
        });
        return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function() {
          isDisposed = true;
        }));
      });
    };
    var enumerableRepeat = Enumerable.repeat = function(value, repeatCount) {
      if (repeatCount == null) {
        repeatCount = -1;
      }
      return new Enumerable(function() {
        var left = repeatCount;
        return new Enumerator(function() {
          if (left === 0) {
            return doneEnumerator;
          }
          if (left > 0) {
            left--;
          }
          return {
            done: false,
            value: value
          };
        });
      });
    };
    var enumerableOf = Enumerable.of = function(source, selector, thisArg) {
      if (selector) {
        var selectorFn = bindCallback(selector, thisArg, 3);
      }
      return new Enumerable(function() {
        var index = -1;
        return new Enumerator(function() {
          return ++index < source.length ? {
            done: false,
            value: !selector ? source[index] : selectorFn(source[index], index, source)
          } : doneEnumerator;
        });
      });
    };
    var Observer = Rx.Observer = function() {};
    Observer.prototype.toNotifier = function() {
      var observer = this;
      return function(n) {
        return n.accept(observer);
      };
    };
    Observer.prototype.asObserver = function() {
      return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));
    };
    Observer.prototype.checked = function() {
      return new CheckedObserver(this);
    };
    var observerCreate = Observer.create = function(onNext, onError, onCompleted) {
      onNext || (onNext = noop);
      onError || (onError = defaultError);
      onCompleted || (onCompleted = noop);
      return new AnonymousObserver(onNext, onError, onCompleted);
    };
    Observer.fromNotifier = function(handler, thisArg) {
      return new AnonymousObserver(function(x) {
        return handler.call(thisArg, notificationCreateOnNext(x));
      }, function(e) {
        return handler.call(thisArg, notificationCreateOnError(e));
      }, function() {
        return handler.call(thisArg, notificationCreateOnCompleted());
      });
    };
    Observer.prototype.notifyOn = function(scheduler) {
      return new ObserveOnObserver(scheduler, this);
    };
    Observer.prototype.makeSafe = function(disposable) {
      return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
    };
    var AbstractObserver = Rx.internals.AbstractObserver = (function(__super__) {
      inherits(AbstractObserver, __super__);
      function AbstractObserver() {
        this.isStopped = false;
        __super__.call(this);
      }
      AbstractObserver.prototype.next = notImplemented;
      AbstractObserver.prototype.error = notImplemented;
      AbstractObserver.prototype.completed = notImplemented;
      AbstractObserver.prototype.onNext = function(value) {
        if (!this.isStopped) {
          this.next(value);
        }
      };
      AbstractObserver.prototype.onError = function(error) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(error);
        }
      };
      AbstractObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.completed();
        }
      };
      AbstractObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      AbstractObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.error(e);
          return true;
        }
        return false;
      };
      return AbstractObserver;
    }(Observer));
    var AnonymousObserver = Rx.AnonymousObserver = (function(__super__) {
      inherits(AnonymousObserver, __super__);
      function AnonymousObserver(onNext, onError, onCompleted) {
        __super__.call(this);
        this._onNext = onNext;
        this._onError = onError;
        this._onCompleted = onCompleted;
      }
      AnonymousObserver.prototype.next = function(value) {
        this._onNext(value);
      };
      AnonymousObserver.prototype.error = function(error) {
        this._onError(error);
      };
      AnonymousObserver.prototype.completed = function() {
        this._onCompleted();
      };
      return AnonymousObserver;
    }(AbstractObserver));
    var CheckedObserver = (function(__super__) {
      inherits(CheckedObserver, __super__);
      function CheckedObserver(observer) {
        __super__.call(this);
        this._observer = observer;
        this._state = 0;
      }
      var CheckedObserverPrototype = CheckedObserver.prototype;
      CheckedObserverPrototype.onNext = function(value) {
        this.checkAccess();
        var res = tryCatch(this._observer.onNext).call(this._observer, value);
        this._state = 0;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onError = function(err) {
        this.checkAccess();
        var res = tryCatch(this._observer.onError).call(this._observer, err);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.onCompleted = function() {
        this.checkAccess();
        var res = tryCatch(this._observer.onCompleted).call(this._observer);
        this._state = 2;
        res === errorObj && thrower(res.e);
      };
      CheckedObserverPrototype.checkAccess = function() {
        if (this._state === 1) {
          throw new Error('Re-entrancy detected');
        }
        if (this._state === 2) {
          throw new Error('Observer completed');
        }
        if (this._state === 0) {
          this._state = 1;
        }
      };
      return CheckedObserver;
    }(Observer));
    var ScheduledObserver = Rx.internals.ScheduledObserver = (function(__super__) {
      inherits(ScheduledObserver, __super__);
      function ScheduledObserver(scheduler, observer) {
        __super__.call(this);
        this.scheduler = scheduler;
        this.observer = observer;
        this.isAcquired = false;
        this.hasFaulted = false;
        this.queue = [];
        this.disposable = new SerialDisposable();
      }
      ScheduledObserver.prototype.next = function(value) {
        var self = this;
        this.queue.push(function() {
          self.observer.onNext(value);
        });
      };
      ScheduledObserver.prototype.error = function(e) {
        var self = this;
        this.queue.push(function() {
          self.observer.onError(e);
        });
      };
      ScheduledObserver.prototype.completed = function() {
        var self = this;
        this.queue.push(function() {
          self.observer.onCompleted();
        });
      };
      ScheduledObserver.prototype.ensureActive = function() {
        var isOwner = false,
            parent = this;
        if (!this.hasFaulted && this.queue.length > 0) {
          isOwner = !this.isAcquired;
          this.isAcquired = true;
        }
        if (isOwner) {
          this.disposable.setDisposable(this.scheduler.scheduleRecursive(function(self) {
            var work;
            if (parent.queue.length > 0) {
              work = parent.queue.shift();
            } else {
              parent.isAcquired = false;
              return ;
            }
            try {
              work();
            } catch (ex) {
              parent.queue = [];
              parent.hasFaulted = true;
              throw ex;
            }
            self();
          }));
        }
      };
      ScheduledObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.disposable.dispose();
      };
      return ScheduledObserver;
    }(AbstractObserver));
    var ObserveOnObserver = (function(__super__) {
      inherits(ObserveOnObserver, __super__);
      function ObserveOnObserver(scheduler, observer, cancel) {
        __super__.call(this, scheduler, observer);
        this._cancel = cancel;
      }
      ObserveOnObserver.prototype.next = function(value) {
        __super__.prototype.next.call(this, value);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.error = function(e) {
        __super__.prototype.error.call(this, e);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.completed = function() {
        __super__.prototype.completed.call(this);
        this.ensureActive();
      };
      ObserveOnObserver.prototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this._cancel && this._cancel.dispose();
        this._cancel = null;
      };
      return ObserveOnObserver;
    })(ScheduledObserver);
    var observableProto;
    var Observable = Rx.Observable = (function() {
      function Observable(subscribe) {
        if (Rx.config.longStackSupport && hasStacks) {
          try {
            throw new Error();
          } catch (e) {
            this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
          }
          var self = this;
          this._subscribe = function(observer) {
            var oldOnError = observer.onError.bind(observer);
            observer.onError = function(err) {
              makeStackTraceLong(err, self);
              oldOnError(err);
            };
            return subscribe.call(self, observer);
          };
        } else {
          this._subscribe = subscribe;
        }
      }
      observableProto = Observable.prototype;
      observableProto.subscribe = observableProto.forEach = function(observerOrOnNext, onError, onCompleted) {
        return this._subscribe(typeof observerOrOnNext === 'object' ? observerOrOnNext : observerCreate(observerOrOnNext, onError, onCompleted));
      };
      observableProto.subscribeOnNext = function(onNext, thisArg) {
        return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) {
          onNext.call(thisArg, x);
        } : onNext));
      };
      observableProto.subscribeOnError = function(onError, thisArg) {
        return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) {
          onError.call(thisArg, e);
        } : onError));
      };
      observableProto.subscribeOnCompleted = function(onCompleted, thisArg) {
        return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() {
          onCompleted.call(thisArg);
        } : onCompleted));
      };
      return Observable;
    })();
    var ObservableBase = Rx.ObservableBase = (function(__super__) {
      inherits(ObservableBase, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            self = state[1];
        var sub = tryCatch(self.subscribeCore).call(self, ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function subscribe(observer) {
        var ado = new AutoDetachObserver(observer),
            state = [ado, this];
        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }
      function ObservableBase() {
        __super__.call(this, subscribe);
      }
      ObservableBase.prototype.subscribeCore = notImplemented;
      return ObservableBase;
    }(Observable));
    observableProto.observeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(new ObserveOnObserver(scheduler, observer));
      }, source);
    };
    observableProto.subscribeOn = function(scheduler) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            d = new SerialDisposable();
        d.setDisposable(m);
        m.setDisposable(scheduler.schedule(function() {
          d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
        }));
        return d;
      }, source);
    };
    var observableFromPromise = Observable.fromPromise = function(promise) {
      return observableDefer(function() {
        var subject = new Rx.AsyncSubject();
        promise.then(function(value) {
          subject.onNext(value);
          subject.onCompleted();
        }, subject.onError.bind(subject));
        return subject;
      });
    };
    observableProto.toPromise = function(promiseCtor) {
      promiseCtor || (promiseCtor = Rx.config.Promise);
      if (!promiseCtor) {
        throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise');
      }
      var source = this;
      return new promiseCtor(function(resolve, reject) {
        var value,
            hasValue = false;
        source.subscribe(function(v) {
          value = v;
          hasValue = true;
        }, reject, function() {
          hasValue && resolve(value);
        });
      });
    };
    var ToArrayObservable = (function(__super__) {
      inherits(ToArrayObservable, __super__);
      function ToArrayObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      ToArrayObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new ToArrayObserver(observer));
      };
      return ToArrayObservable;
    }(ObservableBase));
    function ToArrayObserver(observer) {
      this.observer = observer;
      this.a = [];
      this.isStopped = false;
    }
    ToArrayObserver.prototype.onNext = function(x) {
      if (!this.isStopped) {
        this.a.push(x);
      }
    };
    ToArrayObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    ToArrayObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onNext(this.a);
        this.observer.onCompleted();
      }
    };
    ToArrayObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    ToArrayObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.toArray = function() {
      return new ToArrayObservable(this);
    };
    Observable.create = Observable.createWithDisposable = function(subscribe, parent) {
      return new AnonymousObservable(subscribe, parent);
    };
    var observableDefer = Observable.defer = function(observableFactory) {
      return new AnonymousObservable(function(observer) {
        var result;
        try {
          result = observableFactory();
        } catch (e) {
          return observableThrow(e).subscribe(observer);
        }
        isPromise(result) && (result = observableFromPromise(result));
        return result.subscribe(observer);
      });
    };
    var observableEmpty = Observable.empty = function(scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.scheduleWithState(null, function() {
          observer.onCompleted();
        });
      });
    };
    var FromObservable = (function(__super__) {
      inherits(FromObservable, __super__);
      function FromObservable(iterable, mapper, scheduler) {
        this.iterable = iterable;
        this.mapper = mapper;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromSink(observer, this);
        return sink.run();
      };
      return FromObservable;
    }(ObservableBase));
    var FromSink = (function() {
      function FromSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      FromSink.prototype.run = function() {
        var list = Object(this.parent.iterable),
            it = getIterable(list),
            observer = this.observer,
            mapper = this.parent.mapper;
        function loopRecursive(i, recurse) {
          try {
            var next = it.next();
          } catch (e) {
            return observer.onError(e);
          }
          if (next.done) {
            return observer.onCompleted();
          }
          var result = next.value;
          if (mapper) {
            try {
              result = mapper(result, i);
            } catch (e) {
              return observer.onError(e);
            }
          }
          observer.onNext(result);
          recurse(i + 1);
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return FromSink;
    }());
    var maxSafeInteger = Math.pow(2, 53) - 1;
    function StringIterable(str) {
      this._s = s;
    }
    StringIterable.prototype[$iterator$] = function() {
      return new StringIterator(this._s);
    };
    function StringIterator(str) {
      this._s = s;
      this._l = s.length;
      this._i = 0;
    }
    StringIterator.prototype[$iterator$] = function() {
      return this;
    };
    StringIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
      } : doneEnumerator;
    };
    function ArrayIterable(a) {
      this._a = a;
    }
    ArrayIterable.prototype[$iterator$] = function() {
      return new ArrayIterator(this._a);
    };
    function ArrayIterator(a) {
      this._a = a;
      this._l = toLength(a);
      this._i = 0;
    }
    ArrayIterator.prototype[$iterator$] = function() {
      return this;
    };
    ArrayIterator.prototype.next = function() {
      return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
      } : doneEnumerator;
    };
    function numberIsFinite(value) {
      return typeof value === 'number' && root.isFinite(value);
    }
    function isNan(n) {
      return n !== n;
    }
    function getIterable(o) {
      var i = o[$iterator$],
          it;
      if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
      }
      if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
      }
      if (!i) {
        throw new TypeError('Object is not iterable');
      }
      return o[$iterator$]();
    }
    function sign(value) {
      var number = +value;
      if (number === 0) {
        return number;
      }
      if (isNaN(number)) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }
    function toLength(o) {
      var len = +o.length;
      if (isNaN(len)) {
        return 0;
      }
      if (len === 0 || !numberIsFinite(len)) {
        return len;
      }
      len = sign(len) * Math.floor(Math.abs(len));
      if (len <= 0) {
        return 0;
      }
      if (len > maxSafeInteger) {
        return maxSafeInteger;
      }
      return len;
    }
    var observableFrom = Observable.from = function(iterable, mapFn, thisArg, scheduler) {
      if (iterable == null) {
        throw new Error('iterable cannot be null.');
      }
      if (mapFn && !isFunction(mapFn)) {
        throw new Error('mapFn when provided must be a function');
      }
      if (mapFn) {
        var mapper = bindCallback(mapFn, thisArg, 2);
      }
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromObservable(iterable, mapper, scheduler);
    };
    var FromArrayObservable = (function(__super__) {
      inherits(FromArrayObservable, __super__);
      function FromArrayObservable(args, scheduler) {
        this.args = args;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      FromArrayObservable.prototype.subscribeCore = function(observer) {
        var sink = new FromArraySink(observer, this);
        return sink.run();
      };
      return FromArrayObservable;
    }(ObservableBase));
    function FromArraySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }
    FromArraySink.prototype.run = function() {
      var observer = this.observer,
          args = this.parent.args,
          len = args.length;
      function loopRecursive(i, recurse) {
        if (i < len) {
          observer.onNext(args[i]);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }
      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };
    var observableFromArray = Observable.fromArray = function(array, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    };
    Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new AnonymousObservable(function(o) {
        var first = true;
        return scheduler.scheduleRecursiveWithState(initialState, function(state, self) {
          var hasResult,
              result;
          try {
            if (first) {
              first = false;
            } else {
              state = iterate(state);
            }
            hasResult = condition(state);
            hasResult && (result = resultSelector(state));
          } catch (e) {
            return o.onError(e);
          }
          if (hasResult) {
            o.onNext(result);
            self(state);
          } else {
            o.onCompleted();
          }
        });
      });
    };
    var observableNever = Observable.never = function() {
      return new AnonymousObservable(function() {
        return disposableEmpty;
      });
    };
    function observableOf(scheduler, array) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new FromArrayObservable(array, scheduler);
    }
    Observable.of = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      return new FromArrayObservable(args, currentThreadScheduler);
    };
    Observable.ofWithScheduler = function(scheduler) {
      var len = arguments.length,
          args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      return new FromArrayObservable(args, scheduler);
    };
    Observable.pairs = function(obj, scheduler) {
      scheduler || (scheduler = Rx.Scheduler.currentThread);
      return new AnonymousObservable(function(observer) {
        var keys = Object.keys(obj),
            len = keys.length;
        return scheduler.scheduleRecursiveWithState(0, function(idx, self) {
          if (idx < len) {
            var key = keys[idx];
            observer.onNext([key, obj[key]]);
            self(idx + 1);
          } else {
            observer.onCompleted();
          }
        });
      });
    };
    var RangeObservable = (function(__super__) {
      inherits(RangeObservable, __super__);
      function RangeObservable(start, count, scheduler) {
        this.start = start;
        this.count = count;
        this.scheduler = scheduler;
        __super__.call(this);
      }
      RangeObservable.prototype.subscribeCore = function(observer) {
        var sink = new RangeSink(observer, this);
        return sink.run();
      };
      return RangeObservable;
    }(ObservableBase));
    var RangeSink = (function() {
      function RangeSink(observer, parent) {
        this.observer = observer;
        this.parent = parent;
      }
      RangeSink.prototype.run = function() {
        var start = this.parent.start,
            count = this.parent.count,
            observer = this.observer;
        function loopRecursive(i, recurse) {
          if (i < count) {
            observer.onNext(start + i);
            recurse(i + 1);
          } else {
            observer.onCompleted();
          }
        }
        return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
      };
      return RangeSink;
    }());
    Observable.range = function(start, count, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return new RangeObservable(start, count, scheduler);
    };
    Observable.repeat = function(value, repeatCount, scheduler) {
      isScheduler(scheduler) || (scheduler = currentThreadScheduler);
      return observableReturn(value, scheduler).repeat(repeatCount == null ? -1 : repeatCount);
    };
    var observableReturn = Observable['return'] = Observable.just = Observable.returnValue = function(value, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(o) {
        return scheduler.scheduleWithState(value, function(_, v) {
          o.onNext(v);
          o.onCompleted();
        });
      });
    };
    var observableThrow = Observable['throw'] = Observable.throwError = function(error, scheduler) {
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function(observer) {
        return scheduler.schedule(function() {
          observer.onError(error);
        });
      });
    };
    Observable.throwException = function() {
      return Observable.throwError.apply(null, arguments);
    };
    Observable.using = function(resourceFactory, observableFactory) {
      return new AnonymousObservable(function(observer) {
        var disposable = disposableEmpty,
            resource,
            source;
        try {
          resource = resourceFactory();
          resource && (disposable = resource);
          source = observableFactory(resource);
        } catch (exception) {
          return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);
        }
        return new CompositeDisposable(source.subscribe(observer), disposable);
      });
    };
    observableProto.amb = function(rightSource) {
      var leftSource = this;
      return new AnonymousObservable(function(observer) {
        var choice,
            leftChoice = 'L',
            rightChoice = 'R',
            leftSubscription = new SingleAssignmentDisposable(),
            rightSubscription = new SingleAssignmentDisposable();
        isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
        function choiceL() {
          if (!choice) {
            choice = leftChoice;
            rightSubscription.dispose();
          }
        }
        function choiceR() {
          if (!choice) {
            choice = rightChoice;
            leftSubscription.dispose();
          }
        }
        leftSubscription.setDisposable(leftSource.subscribe(function(left) {
          choiceL();
          if (choice === leftChoice) {
            observer.onNext(left);
          }
        }, function(err) {
          choiceL();
          if (choice === leftChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceL();
          if (choice === leftChoice) {
            observer.onCompleted();
          }
        }));
        rightSubscription.setDisposable(rightSource.subscribe(function(right) {
          choiceR();
          if (choice === rightChoice) {
            observer.onNext(right);
          }
        }, function(err) {
          choiceR();
          if (choice === rightChoice) {
            observer.onError(err);
          }
        }, function() {
          choiceR();
          if (choice === rightChoice) {
            observer.onCompleted();
          }
        }));
        return new CompositeDisposable(leftSubscription, rightSubscription);
      });
    };
    Observable.amb = function() {
      var acc = observableNever(),
          items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      function func(previous, current) {
        return previous.amb(current);
      }
      for (var i = 0,
          len = items.length; i < len; i++) {
        acc = func(acc, items[i]);
      }
      return acc;
    };
    function observableCatchHandler(source, handler) {
      return new AnonymousObservable(function(o) {
        var d1 = new SingleAssignmentDisposable(),
            subscription = new SerialDisposable();
        subscription.setDisposable(d1);
        d1.setDisposable(source.subscribe(function(x) {
          o.onNext(x);
        }, function(e) {
          try {
            var result = handler(e);
          } catch (ex) {
            return o.onError(ex);
          }
          isPromise(result) && (result = observableFromPromise(result));
          var d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(result.subscribe(o));
        }, function(x) {
          o.onCompleted(x);
        }));
        return subscription;
      }, source);
    }
    observableProto['catch'] = observableProto.catchError = observableProto.catchException = function(handlerOrSecond) {
      return typeof handlerOrSecond === 'function' ? observableCatchHandler(this, handlerOrSecond) : observableCatch([this, handlerOrSecond]);
    };
    var observableCatch = Observable.catchError = Observable['catch'] = Observable.catchException = function() {
      var items = [];
      if (Array.isArray(arguments[0])) {
        items = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          items.push(arguments[i]);
        }
      }
      return enumerableOf(items).catchError();
    };
    observableProto.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      if (Array.isArray(args[0])) {
        args[0].unshift(this);
      } else {
        args.unshift(this);
      }
      return combineLatest.apply(this, args);
    };
    var combineLatest = Observable.combineLatest = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop();
      Array.isArray(args[0]) && (args = args[0]);
      return new AnonymousObservable(function(o) {
        var n = args.length,
            falseFactory = function() {
              return false;
            },
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            isDone = arrayInitialize(n, falseFactory),
            values = new Array(n);
        function next(i) {
          hasValue[i] = true;
          if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
            try {
              var res = resultSelector.apply(null, values);
            } catch (e) {
              return o.onError(e);
            }
            o.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            o.onCompleted();
          }
        }
        function done(i) {
          isDone[i] = true;
          isDone.every(identity) && o.onCompleted();
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              values[i] = x;
              next(i);
            }, function(e) {
              o.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          }(idx));
        }
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    observableProto.concat = function() {
      for (var args = [],
          i = 0,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args.unshift(this);
      return observableConcat.apply(null, args);
    };
    var observableConcat = Observable.concat = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        args = new Array(arguments.length);
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      return enumerableOf(args).concat();
    };
    observableProto.concatAll = observableProto.concatObservable = function() {
      return this.merge(1);
    };
    var MergeObservable = (function(__super__) {
      inherits(MergeObservable, __super__);
      function MergeObservable(source, maxConcurrent) {
        this.source = source;
        this.maxConcurrent = maxConcurrent;
        __super__.call(this);
      }
      MergeObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable();
        g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
        return g;
      };
      return MergeObservable;
    }(ObservableBase));
    var MergeObserver = (function() {
      function MergeObserver(o, max, g) {
        this.o = o;
        this.max = max;
        this.g = g;
        this.done = false;
        this.q = [];
        this.activeCount = 0;
        this.isStopped = false;
      }
      MergeObserver.prototype.handleSubscribe = function(xs) {
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(xs) && (xs = observableFromPromise(xs));
        sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
      };
      MergeObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return ;
        }
        if (this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeObserver;
    }());
    observableProto.merge = function(maxConcurrentOrOther) {
      return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther);
    };
    var observableMerge = Observable.merge = function() {
      var scheduler,
          sources = [],
          i,
          len = arguments.length;
      if (!arguments[0]) {
        scheduler = immediateScheduler;
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else if (isScheduler(arguments[0])) {
        scheduler = arguments[0];
        for (i = 1; i < len; i++) {
          sources.push(arguments[i]);
        }
      } else {
        scheduler = immediateScheduler;
        for (i = 0; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      if (Array.isArray(sources[0])) {
        sources = sources[0];
      }
      return observableOf(scheduler, sources).mergeAll();
    };
    var CompositeError = Rx.CompositeError = function(errors) {
      this.name = "NotImplementedError";
      this.innerErrors = errors;
      this.message = 'This contains multiple errors. Check the innerErrors';
      Error.call(this);
    };
    CompositeError.prototype = Error.prototype;
    Observable.mergeDelayError = function() {
      var args;
      if (Array.isArray(arguments[0])) {
        args = arguments[0];
      } else {
        var len = arguments.length;
        args = new Array(len);
        for (var i = 0; i < len; i++) {
          args[i] = arguments[i];
        }
      }
      var source = observableOf(null, args);
      return new AnonymousObservable(function(o) {
        var group = new CompositeDisposable(),
            m = new SingleAssignmentDisposable(),
            isStopped = false,
            errors = [];
        function setCompletion() {
          if (errors.length === 0) {
            o.onCompleted();
          } else if (errors.length === 1) {
            o.onError(errors[0]);
          } else {
            o.onError(new CompositeError(errors));
          }
        }
        group.add(m);
        m.setDisposable(source.subscribe(function(innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
          innerSubscription.setDisposable(innerSource.subscribe(function(x) {
            o.onNext(x);
          }, function(e) {
            errors.push(e);
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }, function() {
            group.remove(innerSubscription);
            isStopped && group.length === 1 && setCompletion();
          }));
        }, function(e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        }, function() {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
        return group;
      });
    };
    var MergeAllObservable = (function(__super__) {
      inherits(MergeAllObservable, __super__);
      function MergeAllObservable(source) {
        this.source = source;
        __super__.call(this);
      }
      MergeAllObservable.prototype.subscribeCore = function(observer) {
        var g = new CompositeDisposable(),
            m = new SingleAssignmentDisposable();
        g.add(m);
        m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
        return g;
      };
      return MergeAllObservable;
    }(ObservableBase));
    var MergeAllObserver = (function() {
      function MergeAllObserver(o, g) {
        this.o = o;
        this.g = g;
        this.isStopped = false;
        this.done = false;
      }
      MergeAllObserver.prototype.onNext = function(innerSource) {
        if (this.isStopped) {
          return ;
        }
        var sad = new SingleAssignmentDisposable();
        this.g.add(sad);
        isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
        sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));
      };
      MergeAllObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeAllObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.g.length === 1 && this.o.onCompleted();
        }
      };
      MergeAllObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      MergeAllObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }
        return false;
      };
      function InnerObserver(parent, g, sad) {
        this.parent = parent;
        this.g = g;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function(x) {
        if (!this.isStopped) {
          this.parent.o.onNext(x);
        }
      };
      InnerObserver.prototype.onError = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function() {
        if (!this.isStopped) {
          var parent = this.parent;
          this.isStopped = true;
          parent.g.remove(this.sad);
          parent.done && parent.g.length === 1 && parent.o.onCompleted();
        }
      };
      InnerObserver.prototype.dispose = function() {
        this.isStopped = true;
      };
      InnerObserver.prototype.fail = function(e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }
        return false;
      };
      return MergeAllObserver;
    }());
    observableProto.mergeAll = observableProto.mergeObservable = function() {
      return new MergeAllObservable(this);
    };
    observableProto.onErrorResumeNext = function(second) {
      if (!second) {
        throw new Error('Second observable is required');
      }
      return onErrorResumeNext([this, second]);
    };
    var onErrorResumeNext = Observable.onErrorResumeNext = function() {
      var sources = [];
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        for (var i = 0,
            len = arguments.length; i < len; i++) {
          sources.push(arguments[i]);
        }
      }
      return new AnonymousObservable(function(observer) {
        var pos = 0,
            subscription = new SerialDisposable(),
            cancelable = immediateScheduler.scheduleRecursive(function(self) {
              var current,
                  d;
              if (pos < sources.length) {
                current = sources[pos++];
                isPromise(current) && (current = observableFromPromise(current));
                d = new SingleAssignmentDisposable();
                subscription.setDisposable(d);
                d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
              } else {
                observer.onCompleted();
              }
            });
        return new CompositeDisposable(subscription, cancelable);
      });
    };
    observableProto.skipUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var isOpen = false;
        var disposables = new CompositeDisposable(source.subscribe(function(left) {
          isOpen && o.onNext(left);
        }, function(e) {
          o.onError(e);
        }, function() {
          isOpen && o.onCompleted();
        }));
        isPromise(other) && (other = observableFromPromise(other));
        var rightSubscription = new SingleAssignmentDisposable();
        disposables.add(rightSubscription);
        rightSubscription.setDisposable(other.subscribe(function() {
          isOpen = true;
          rightSubscription.dispose();
        }, function(e) {
          o.onError(e);
        }, function() {
          rightSubscription.dispose();
        }));
        return disposables;
      }, source);
    };
    observableProto['switch'] = observableProto.switchLatest = function() {
      var sources = this;
      return new AnonymousObservable(function(observer) {
        var hasLatest = false,
            innerSubscription = new SerialDisposable(),
            isStopped = false,
            latest = 0,
            subscription = sources.subscribe(function(innerSource) {
              var d = new SingleAssignmentDisposable(),
                  id = ++latest;
              hasLatest = true;
              innerSubscription.setDisposable(d);
              isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
              d.setDisposable(innerSource.subscribe(function(x) {
                latest === id && observer.onNext(x);
              }, function(e) {
                latest === id && observer.onError(e);
              }, function() {
                if (latest === id) {
                  hasLatest = false;
                  isStopped && observer.onCompleted();
                }
              }));
            }, function(e) {
              observer.onError(e);
            }, function() {
              isStopped = true;
              !hasLatest && observer.onCompleted();
            });
        return new CompositeDisposable(subscription, innerSubscription);
      }, sources);
    };
    observableProto.takeUntil = function(other) {
      var source = this;
      return new AnonymousObservable(function(o) {
        isPromise(other) && (other = observableFromPromise(other));
        return new CompositeDisposable(source.subscribe(o), other.subscribe(function() {
          o.onCompleted();
        }, function(e) {
          o.onError(e);
        }, noop));
      }, source);
    };
    observableProto.withLatestFrom = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var resultSelector = args.pop(),
          source = this;
      if (typeof source === 'undefined') {
        throw new Error('Source observable not found for withLatestFrom().');
      }
      if (typeof resultSelector !== 'function') {
        throw new Error('withLatestFrom() expects a resultSelector function.');
      }
      if (Array.isArray(args[0])) {
        args = args[0];
      }
      return new AnonymousObservable(function(observer) {
        var falseFactory = function() {
          return false;
        },
            n = args.length,
            hasValue = arrayInitialize(n, falseFactory),
            hasValueAll = false,
            values = new Array(n);
        var subscriptions = new Array(n + 1);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var other = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(other) && (other = observableFromPromise(other));
            sad.setDisposable(other.subscribe(function(x) {
              values[i] = x;
              hasValue[i] = true;
              hasValueAll = hasValue.every(identity);
            }, observer.onError.bind(observer), function() {}));
            subscriptions[i] = sad;
          }(idx));
        }
        var sad = new SingleAssignmentDisposable();
        sad.setDisposable(source.subscribe(function(x) {
          var res;
          var allValues = [x].concat(values);
          if (!hasValueAll)
            return ;
          try {
            res = resultSelector.apply(null, allValues);
          } catch (ex) {
            observer.onError(ex);
            return ;
          }
          observer.onNext(res);
        }, observer.onError.bind(observer), function() {
          observer.onCompleted();
        }));
        subscriptions[n] = sad;
        return new CompositeDisposable(subscriptions);
      }, this);
    };
    function zipArray(second, resultSelector) {
      var first = this;
      return new AnonymousObservable(function(observer) {
        var index = 0,
            len = second.length;
        return first.subscribe(function(left) {
          if (index < len) {
            var right = second[index++],
                result;
            try {
              result = resultSelector(left, right);
            } catch (e) {
              return observer.onError(e);
            }
            observer.onNext(result);
          } else {
            observer.onCompleted();
          }
        }, function(e) {
          observer.onError(e);
        }, function() {
          observer.onCompleted();
        });
      }, first);
    }
    function falseFactory() {
      return false;
    }
    function emptyArrayFactory() {
      return [];
    }
    observableProto.zip = function() {
      if (Array.isArray(arguments[0])) {
        return zipArray.apply(this, arguments);
      }
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var parent = this,
          resultSelector = args.pop();
      args.unshift(parent);
      return new AnonymousObservable(function(observer) {
        var n = args.length,
            queues = arrayInitialize(n, emptyArrayFactory),
            isDone = arrayInitialize(n, falseFactory);
        function next(i) {
          var res,
              queuedValues;
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            try {
              queuedValues = queues.map(function(x) {
                return x.shift();
              });
              res = resultSelector.apply(parent, queuedValues);
            } catch (ex) {
              observer.onError(ex);
              return ;
            }
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(function(x) {
            return x;
          })) {
            observer.onCompleted();
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            var source = args[i],
                sad = new SingleAssignmentDisposable();
            isPromise(source) && (source = observableFromPromise(source));
            sad.setDisposable(source.subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
            subscriptions[i] = sad;
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      }, parent);
    };
    Observable.zip = function() {
      var len = arguments.length,
          args = new Array(len);
      for (var i = 0; i < len; i++) {
        args[i] = arguments[i];
      }
      var first = args.shift();
      return first.zip.apply(first, args);
    };
    Observable.zipArray = function() {
      var sources;
      if (Array.isArray(arguments[0])) {
        sources = arguments[0];
      } else {
        var len = arguments.length;
        sources = new Array(len);
        for (var i = 0; i < len; i++) {
          sources[i] = arguments[i];
        }
      }
      return new AnonymousObservable(function(observer) {
        var n = sources.length,
            queues = arrayInitialize(n, function() {
              return [];
            }),
            isDone = arrayInitialize(n, function() {
              return false;
            });
        function next(i) {
          if (queues.every(function(x) {
            return x.length > 0;
          })) {
            var res = queues.map(function(x) {
              return x.shift();
            });
            observer.onNext(res);
          } else if (isDone.filter(function(x, j) {
            return j !== i;
          }).every(identity)) {
            observer.onCompleted();
            return ;
          }
        }
        ;
        function done(i) {
          isDone[i] = true;
          if (isDone.every(identity)) {
            observer.onCompleted();
            return ;
          }
        }
        var subscriptions = new Array(n);
        for (var idx = 0; idx < n; idx++) {
          (function(i) {
            subscriptions[i] = new SingleAssignmentDisposable();
            subscriptions[i].setDisposable(sources[i].subscribe(function(x) {
              queues[i].push(x);
              next(i);
            }, function(e) {
              observer.onError(e);
            }, function() {
              done(i);
            }));
          })(idx);
        }
        return new CompositeDisposable(subscriptions);
      });
    };
    observableProto.asObservable = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(o);
      }, this);
    };
    observableProto.bufferWithCount = function(count, skip) {
      if (typeof skip !== 'number') {
        skip = count;
      }
      return this.windowWithCount(count, skip).selectMany(function(x) {
        return x.toArray();
      }).where(function(x) {
        return x.length > 0;
      });
    };
    observableProto.dematerialize = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(function(x) {
          return x.accept(o);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto.distinctUntilChanged = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hasCurrentKey = false,
            currentKey;
        return source.subscribe(function(value) {
          var key = value;
          if (keySelector) {
            try {
              key = keySelector(value);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          if (hasCurrentKey) {
            try {
              var comparerEquals = comparer(currentKey, key);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          if (!hasCurrentKey || !comparerEquals) {
            hasCurrentKey = true;
            currentKey = key;
            o.onNext(value);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    observableProto['do'] = observableProto.tap = observableProto.doAction = function(observerOrOnNext, onError, onCompleted) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var tapObserver = !observerOrOnNext || isFunction(observerOrOnNext) ? observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop) : observerOrOnNext;
        return source.subscribe(function(x) {
          try {
            tapObserver.onNext(x);
          } catch (e) {
            observer.onError(e);
          }
          observer.onNext(x);
        }, function(err) {
          try {
            tapObserver.onError(err);
          } catch (e) {
            observer.onError(e);
          }
          observer.onError(err);
        }, function() {
          try {
            tapObserver.onCompleted();
          } catch (e) {
            observer.onError(e);
          }
          observer.onCompleted();
        });
      }, this);
    };
    observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg) {
      return this.tap(typeof thisArg !== 'undefined' ? function(x) {
        onNext.call(thisArg, x);
      } : onNext);
    };
    observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg) {
      return this.tap(noop, typeof thisArg !== 'undefined' ? function(e) {
        onError.call(thisArg, e);
      } : onError);
    };
    observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg) {
      return this.tap(noop, null, typeof thisArg !== 'undefined' ? function() {
        onCompleted.call(thisArg);
      } : onCompleted);
    };
    observableProto['finally'] = observableProto.ensure = function(action) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var subscription;
        try {
          subscription = source.subscribe(observer);
        } catch (e) {
          action();
          throw e;
        }
        return disposableCreate(function() {
          try {
            subscription.dispose();
          } catch (e) {
            throw e;
          } finally {
            action();
          }
        });
      }, this);
    };
    observableProto.finallyAction = function(action) {
      return this.ensure(action);
    };
    observableProto.ignoreElements = function() {
      var source = this;
      return new AnonymousObservable(function(o) {
        return source.subscribe(noop, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.materialize = function() {
      var source = this;
      return new AnonymousObservable(function(observer) {
        return source.subscribe(function(value) {
          observer.onNext(notificationCreateOnNext(value));
        }, function(e) {
          observer.onNext(notificationCreateOnError(e));
          observer.onCompleted();
        }, function() {
          observer.onNext(notificationCreateOnCompleted());
          observer.onCompleted();
        });
      }, source);
    };
    observableProto.repeat = function(repeatCount) {
      return enumerableRepeat(this, repeatCount).concat();
    };
    observableProto.retry = function(retryCount) {
      return enumerableRepeat(this, retryCount).catchError();
    };
    observableProto.retryWhen = function(notifier) {
      return enumerableRepeat(this).catchErrorWhen(notifier);
    };
    observableProto.scan = function() {
      var hasSeed = false,
          seed,
          accumulator,
          source = this;
      if (arguments.length === 2) {
        hasSeed = true;
        seed = arguments[0];
        accumulator = arguments[1];
      } else {
        accumulator = arguments[0];
      }
      return new AnonymousObservable(function(o) {
        var hasAccumulation,
            accumulation,
            hasValue;
        return source.subscribe(function(x) {
          !hasValue && (hasValue = true);
          try {
            if (hasAccumulation) {
              accumulation = accumulator(accumulation, x);
            } else {
              accumulation = hasSeed ? accumulator(seed, x) : x;
              hasAccumulation = true;
            }
          } catch (e) {
            o.onError(e);
            return ;
          }
          o.onNext(accumulation);
        }, function(e) {
          o.onError(e);
        }, function() {
          !hasValue && hasSeed && o.onNext(seed);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && o.onNext(q.shift());
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.startWith = function() {
      var values,
          scheduler,
          start = 0;
      if (!!arguments.length && isScheduler(arguments[0])) {
        scheduler = arguments[0];
        start = 1;
      } else {
        scheduler = immediateScheduler;
      }
      for (var args = [],
          i = start,
          len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      return enumerableOf([observableFromArray(args, scheduler), this]).concat();
    };
    observableProto.takeLast = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          while (q.length > 0) {
            o.onNext(q.shift());
          }
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeLastBuffer = function(count) {
      var source = this;
      return new AnonymousObservable(function(o) {
        var q = [];
        return source.subscribe(function(x) {
          q.push(x);
          q.length > count && q.shift();
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onNext(q);
          o.onCompleted();
        });
      }, source);
    };
    observableProto.windowWithCount = function(count, skip) {
      var source = this;
      +count || (count = 0);
      Math.abs(count) === Infinity && (count = 0);
      if (count <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      skip == null && (skip = count);
      +skip || (skip = 0);
      Math.abs(skip) === Infinity && (skip = 0);
      if (skip <= 0) {
        throw new ArgumentOutOfRangeError();
      }
      return new AnonymousObservable(function(observer) {
        var m = new SingleAssignmentDisposable(),
            refCountDisposable = new RefCountDisposable(m),
            n = 0,
            q = [];
        function createWindow() {
          var s = new Subject();
          q.push(s);
          observer.onNext(addRef(s, refCountDisposable));
        }
        createWindow();
        m.setDisposable(source.subscribe(function(x) {
          for (var i = 0,
              len = q.length; i < len; i++) {
            q[i].onNext(x);
          }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        }, function(e) {
          while (q.length > 0) {
            q.shift().onError(e);
          }
          observer.onError(e);
        }, function() {
          while (q.length > 0) {
            q.shift().onCompleted();
          }
          observer.onCompleted();
        }));
        return refCountDisposable;
      }, source);
    };
    function concatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).concatAll();
    }
    observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.concatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        });
      }
      return isFunction(selector) ? concatMap(this, selector, thisArg) : concatMap(this, function() {
        return selector;
      });
    };
    observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this,
          onNextFunc = bindCallback(onNext, thisArg, 2),
          onErrorFunc = bindCallback(onError, thisArg, 1),
          onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, this).concatAll();
    };
    observableProto.defaultIfEmpty = function(defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function(observer) {
        var found = false;
        return source.subscribe(function(x) {
          found = true;
          observer.onNext(x);
        }, function(e) {
          observer.onError(e);
        }, function() {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };
    function arrayIndexOfComparer(array, item, comparer) {
      for (var i = 0,
          len = array.length; i < len; i++) {
        if (comparer(array[i], item)) {
          return i;
        }
      }
      return -1;
    }
    function HashSet(comparer) {
      this.comparer = comparer;
      this.set = [];
    }
    HashSet.prototype.push = function(value) {
      var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
      retValue && this.set.push(value);
      return retValue;
    };
    observableProto.distinct = function(keySelector, comparer) {
      var source = this;
      comparer || (comparer = defaultComparer);
      return new AnonymousObservable(function(o) {
        var hashSet = new HashSet(comparer);
        return source.subscribe(function(x) {
          var key = x;
          if (keySelector) {
            try {
              key = keySelector(x);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          hashSet.push(key) && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, this);
    };
    var MapObservable = (function(__super__) {
      inherits(MapObservable, __super__);
      function MapObservable(source, selector, thisArg) {
        this.source = source;
        this.selector = bindCallback(selector, thisArg, 3);
        __super__.call(this);
      }
      MapObservable.prototype.internalMap = function(selector, thisArg) {
        var self = this;
        return new MapObservable(this.source, function(x, i, o) {
          return selector.call(this, self.selector(x, i, o), i, o);
        }, thisArg);
      };
      MapObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new MapObserver(observer, this.selector, this));
      };
      return MapObservable;
    }(ObservableBase));
    function MapObserver(observer, selector, source) {
      this.observer = observer;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    MapObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return ;
      }
      var result = tryCatch(this.selector).call(this, x, this.i++, this.source);
      if (result === errorObj) {
        return this.observer.onError(result.e);
      }
      this.observer.onNext(result);
    };
    MapObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    MapObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    MapObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    MapObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.map = observableProto.select = function(selector, thisArg) {
      var selectorFn = typeof selector === 'function' ? selector : function() {
        return selector;
      };
      return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg);
    };
    observableProto.pluck = function() {
      var args = arguments,
          len = arguments.length;
      if (len === 0) {
        throw new Error('List of properties cannot be empty.');
      }
      return this.map(function(x) {
        var currentProp = x;
        for (var i = 0; i < len; i++) {
          var p = currentProp[args[i]];
          if (typeof p !== 'undefined') {
            currentProp = p;
          } else {
            return undefined;
          }
        }
        return currentProp;
      });
    };
    observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg) {
      var source = this;
      return new AnonymousObservable(function(observer) {
        var index = 0;
        return source.subscribe(function(x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        }, function(err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        }, function() {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return ;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
      }, source).mergeAll();
    };
    function flatMap(source, selector, thisArg) {
      var selectorFunc = bindCallback(selector, thisArg, 3);
      return source.map(function(x, i) {
        var result = selectorFunc(x, i, source);
        isPromise(result) && (result = observableFromPromise(result));
        (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
        return result;
      }).mergeAll();
    }
    observableProto.selectMany = observableProto.flatMap = function(selector, resultSelector, thisArg) {
      if (isFunction(selector) && isFunction(resultSelector)) {
        return this.flatMap(function(x, i) {
          var selectorResult = selector(x, i);
          isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
          (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
          return selectorResult.map(function(y, i2) {
            return resultSelector(x, y, i, i2);
          });
        }, thisArg);
      }
      return isFunction(selector) ? flatMap(this, selector, thisArg) : flatMap(this, function() {
        return selector;
      });
    };
    observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function(selector, thisArg) {
      return this.select(selector, thisArg).switchLatest();
    };
    observableProto.skip = function(count) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining <= 0) {
            o.onNext(x);
          } else {
            remaining--;
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.skipWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = false;
        return source.subscribe(function(x) {
          if (!running) {
            try {
              running = !callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return ;
            }
          }
          running && o.onNext(x);
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.take = function(count, scheduler) {
      if (count < 0) {
        throw new ArgumentOutOfRangeError();
      }
      if (count === 0) {
        return observableEmpty(scheduler);
      }
      var source = this;
      return new AnonymousObservable(function(o) {
        var remaining = count;
        return source.subscribe(function(x) {
          if (remaining-- > 0) {
            o.onNext(x);
            remaining === 0 && o.onCompleted();
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    observableProto.takeWhile = function(predicate, thisArg) {
      var source = this,
          callback = bindCallback(predicate, thisArg, 3);
      return new AnonymousObservable(function(o) {
        var i = 0,
            running = true;
        return source.subscribe(function(x) {
          if (running) {
            try {
              running = callback(x, i++, source);
            } catch (e) {
              o.onError(e);
              return ;
            }
            if (running) {
              o.onNext(x);
            } else {
              o.onCompleted();
            }
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          o.onCompleted();
        });
      }, source);
    };
    var FilterObservable = (function(__super__) {
      inherits(FilterObservable, __super__);
      function FilterObservable(source, predicate, thisArg) {
        this.source = source;
        this.predicate = bindCallback(predicate, thisArg, 3);
        __super__.call(this);
      }
      FilterObservable.prototype.subscribeCore = function(observer) {
        return this.source.subscribe(new FilterObserver(observer, this.predicate, this));
      };
      FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
        var self = this;
        return new FilterObservable(this.source, function(x, i, o) {
          return self.predicate(x, i, o) && predicate.call(this, x, i, o);
        }, thisArg);
      };
      return FilterObservable;
    }(ObservableBase));
    function FilterObserver(observer, predicate, source) {
      this.observer = observer;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
    FilterObserver.prototype.onNext = function(x) {
      if (this.isStopped) {
        return ;
      }
      var shouldYield = tryCatch(this.predicate).call(this, x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.observer.onError(shouldYield.e);
      }
      shouldYield && this.observer.onNext(x);
    };
    FilterObserver.prototype.onError = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
      }
    };
    FilterObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onCompleted();
      }
    };
    FilterObserver.prototype.dispose = function() {
      this.isStopped = true;
    };
    FilterObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }
      return false;
    };
    observableProto.filter = observableProto.where = function(predicate, thisArg) {
      return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg);
    };
    observableProto.transduce = function(transducer) {
      var source = this;
      function transformForObserver(o) {
        return {
          '@@transducer/init': function() {
            return o;
          },
          '@@transducer/step': function(obs, input) {
            return obs.onNext(input);
          },
          '@@transducer/result': function(obs) {
            return obs.onCompleted();
          }
        };
      }
      return new AnonymousObservable(function(o) {
        var xform = transducer(transformForObserver(o));
        return source.subscribe(function(v) {
          try {
            xform['@@transducer/step'](o, v);
          } catch (e) {
            o.onError(e);
          }
        }, function(e) {
          o.onError(e);
        }, function() {
          xform['@@transducer/result'](o);
        });
      }, source);
    };
    var AnonymousObservable = Rx.AnonymousObservable = (function(__super__) {
      inherits(AnonymousObservable, __super__);
      function fixSubscriber(subscriber) {
        return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
      }
      function setDisposable(s, state) {
        var ado = state[0],
            subscribe = state[1];
        var sub = tryCatch(subscribe)(ado);
        if (sub === errorObj) {
          if (!ado.fail(errorObj.e)) {
            return thrower(errorObj.e);
          }
        }
        ado.setDisposable(fixSubscriber(sub));
      }
      function AnonymousObservable(subscribe, parent) {
        this.source = parent;
        function s(observer) {
          var ado = new AutoDetachObserver(observer),
              state = [ado, subscribe];
          if (currentThreadScheduler.scheduleRequired()) {
            currentThreadScheduler.scheduleWithState(state, setDisposable);
          } else {
            setDisposable(null, state);
          }
          return ado;
        }
        __super__.call(this, s);
      }
      return AnonymousObservable;
    }(Observable));
    var AutoDetachObserver = (function(__super__) {
      inherits(AutoDetachObserver, __super__);
      function AutoDetachObserver(observer) {
        __super__.call(this);
        this.observer = observer;
        this.m = new SingleAssignmentDisposable();
      }
      var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
      AutoDetachObserverPrototype.next = function(value) {
        var result = tryCatch(this.observer.onNext).call(this.observer, value);
        if (result === errorObj) {
          this.dispose();
          thrower(result.e);
        }
      };
      AutoDetachObserverPrototype.error = function(err) {
        var result = tryCatch(this.observer.onError).call(this.observer, err);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.completed = function() {
        var result = tryCatch(this.observer.onCompleted).call(this.observer);
        this.dispose();
        result === errorObj && thrower(result.e);
      };
      AutoDetachObserverPrototype.setDisposable = function(value) {
        this.m.setDisposable(value);
      };
      AutoDetachObserverPrototype.getDisposable = function() {
        return this.m.getDisposable();
      };
      AutoDetachObserverPrototype.dispose = function() {
        __super__.prototype.dispose.call(this);
        this.m.dispose();
      };
      return AutoDetachObserver;
    }(AbstractObserver));
    var InnerSubscription = function(subject, observer) {
      this.subject = subject;
      this.observer = observer;
    };
    InnerSubscription.prototype.dispose = function() {
      if (!this.subject.isDisposed && this.observer !== null) {
        var idx = this.subject.observers.indexOf(this.observer);
        this.subject.observers.splice(idx, 1);
        this.observer = null;
      }
    };
    var Subject = Rx.Subject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
          return disposableEmpty;
        }
        observer.onCompleted();
        return disposableEmpty;
      }
      inherits(Subject, __super__);
      function Subject() {
        __super__.call(this, subscribe);
        this.isDisposed = false, this.isStopped = false, this.observers = [];
        this.hasError = false;
      }
      addProperties(Subject.prototype, Observer.prototype, {
        hasObservers: function() {
          return this.observers.length > 0;
        },
        onCompleted: function() {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onCompleted();
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.error = error;
            this.hasError = true;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (!this.isStopped) {
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onNext(value);
            }
          }
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
        }
      });
      Subject.create = function(observer, observable) {
        return new AnonymousSubject(observer, observable);
      };
      return Subject;
    }(Observable));
    var AsyncSubject = Rx.AsyncSubject = (function(__super__) {
      function subscribe(observer) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.observers.push(observer);
          return new InnerSubscription(this, observer);
        }
        if (this.hasError) {
          observer.onError(this.error);
        } else if (this.hasValue) {
          observer.onNext(this.value);
          observer.onCompleted();
        } else {
          observer.onCompleted();
        }
        return disposableEmpty;
      }
      inherits(AsyncSubject, __super__);
      function AsyncSubject() {
        __super__.call(this, subscribe);
        this.isDisposed = false;
        this.isStopped = false;
        this.hasValue = false;
        this.observers = [];
        this.hasError = false;
      }
      addProperties(AsyncSubject.prototype, Observer, {
        hasObservers: function() {
          checkDisposed(this);
          return this.observers.length > 0;
        },
        onCompleted: function() {
          var i,
              len;
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            var os = cloneArray(this.observers),
                len = os.length;
            if (this.hasValue) {
              for (i = 0; i < len; i++) {
                var o = os[i];
                o.onNext(this.value);
                o.onCompleted();
              }
            } else {
              for (i = 0; i < len; i++) {
                os[i].onCompleted();
              }
            }
            this.observers.length = 0;
          }
        },
        onError: function(error) {
          checkDisposed(this);
          if (!this.isStopped) {
            this.isStopped = true;
            this.hasError = true;
            this.error = error;
            for (var i = 0,
                os = cloneArray(this.observers),
                len = os.length; i < len; i++) {
              os[i].onError(error);
            }
            this.observers.length = 0;
          }
        },
        onNext: function(value) {
          checkDisposed(this);
          if (this.isStopped) {
            return ;
          }
          this.value = value;
          this.hasValue = true;
        },
        dispose: function() {
          this.isDisposed = true;
          this.observers = null;
          this.exception = null;
          this.value = null;
        }
      });
      return AsyncSubject;
    }(Observable));
    var AnonymousSubject = Rx.AnonymousSubject = (function(__super__) {
      inherits(AnonymousSubject, __super__);
      function subscribe(observer) {
        return this.observable.subscribe(observer);
      }
      function AnonymousSubject(observer, observable) {
        this.observer = observer;
        this.observable = observable;
        __super__.call(this, subscribe);
      }
      addProperties(AnonymousSubject.prototype, Observer.prototype, {
        onCompleted: function() {
          this.observer.onCompleted();
        },
        onError: function(error) {
          this.observer.onError(error);
        },
        onNext: function(value) {
          this.observer.onNext(value);
        }
      });
      return AnonymousSubject;
    }(Observable));
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      root.Rx = Rx;
      define(function() {
        return Rx;
      });
    } else if (freeExports && freeModule) {
      if (moduleExports) {
        (freeModule.exports = Rx).Rx = Rx;
      } else {
        freeExports.Rx = Rx;
      }
    } else {
      root.Rx = Rx;
    }
    var rEndingLine = captureLine();
  }.call(this));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/facade/lang", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/lang";
  var _global,
      Type,
      BaseException,
      Math,
      Date,
      assertionsEnabled_,
      ABSTRACT,
      IMPLEMENTS,
      StringWrapper,
      StringJoiner,
      NumberParseError,
      NumberWrapper,
      RegExp,
      RegExpWrapper,
      RegExpMatcherWrapper,
      FunctionWrapper,
      Json,
      DateWrapper;
  function assertionsEnabled() {
    return assertionsEnabled_;
  }
  function CONST_EXPR(expr) {
    return expr;
  }
  function CONST() {
    return (function(target) {
      return target;
    });
  }
  function isPresent(obj) {
    return obj !== undefined && obj !== null;
  }
  function isBlank(obj) {
    return obj === undefined || obj === null;
  }
  function isString(obj) {
    return typeof obj === "string";
  }
  function isFunction(obj) {
    return typeof obj === "function";
  }
  function isType(obj) {
    return isFunction(obj);
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token === undefined || token === null) {
      return '' + token;
    }
    if (token.name) {
      return token.name;
    }
    return token.toString();
  }
  function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
  }
  function getMapKey(value) {
    return value;
  }
  function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
  }
  function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
  }
  function print(obj) {
    if (obj instanceof Error) {
      console.log(obj.stack);
    } else {
      console.log(obj);
    }
  }
  $__export("assertionsEnabled", assertionsEnabled);
  $__export("CONST_EXPR", CONST_EXPR);
  $__export("CONST", CONST);
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("isString", isString);
  $__export("isFunction", isFunction);
  $__export("isType", isType);
  $__export("stringify", stringify);
  $__export("looseIdentical", looseIdentical);
  $__export("getMapKey", getMapKey);
  $__export("normalizeBlank", normalizeBlank);
  $__export("isJsObject", isJsObject);
  $__export("print", print);
  return {
    setters: [],
    execute: function() {
      _global = (typeof window === 'undefined' ? global : window);
      $__export("global", _global);
      Type = Function;
      $__export("Type", Type);
      BaseException = (function($__super) {
        function BaseException(message) {
          $traceurRuntime.superConstructor(BaseException).call(this, message);
          this.message = message;
          this.stack = (new Error()).stack;
        }
        return ($traceurRuntime.createClass)(BaseException, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(Error));
      $__export("BaseException", BaseException);
      Math = _global.Math;
      $__export("Math", Math);
      Date = _global.Date;
      $__export("Date", Date);
      assertionsEnabled_ = typeof _global['assert'] !== 'undefined';
      _global.assert = function assert(condition) {
        if (assertionsEnabled_) {
          _global['assert'].call(condition);
        }
      };
      ABSTRACT = (function() {
        function ABSTRACT() {}
        return ($traceurRuntime.createClass)(ABSTRACT, {}, {});
      }());
      $__export("ABSTRACT", ABSTRACT);
      IMPLEMENTS = (function() {
        function IMPLEMENTS() {}
        return ($traceurRuntime.createClass)(IMPLEMENTS, {}, {});
      }());
      $__export("IMPLEMENTS", IMPLEMENTS);
      StringWrapper = (function() {
        function StringWrapper() {}
        return ($traceurRuntime.createClass)(StringWrapper, {}, {
          fromCharCode: function(code) {
            return String.fromCharCode(code);
          },
          charCodeAt: function(s, index) {
            return s.charCodeAt(index);
          },
          split: function(s, regExp) {
            return s.split(regExp);
          },
          equals: function(s, s2) {
            return s === s2;
          },
          replace: function(s, from, replace) {
            return s.replace(from, replace);
          },
          replaceAll: function(s, from, replace) {
            return s.replace(from, replace);
          },
          toUpperCase: function(s) {
            return s.toUpperCase();
          },
          toLowerCase: function(s) {
            return s.toLowerCase();
          },
          startsWith: function(s, start) {
            return s.startsWith(start);
          },
          substring: function(s, start) {
            var end = arguments[2] !== (void 0) ? arguments[2] : null;
            return s.substring(start, end === null ? undefined : end);
          },
          replaceAllMapped: function(s, from, cb) {
            return s.replace(from, function() {
              for (var matches = [],
                  $__1 = 0; $__1 < arguments.length; $__1++)
                matches[$__1] = arguments[$__1];
              matches.splice(-2, 2);
              return cb(matches);
            });
          },
          contains: function(s, substr) {
            return s.indexOf(substr) != -1;
          }
        });
      }());
      $__export("StringWrapper", StringWrapper);
      StringJoiner = (function() {
        function StringJoiner() {
          var parts = arguments[0] !== (void 0) ? arguments[0] : [];
          this.parts = parts;
        }
        return ($traceurRuntime.createClass)(StringJoiner, {
          add: function(part) {
            this.parts.push(part);
          },
          toString: function() {
            return this.parts.join("");
          }
        }, {});
      }());
      $__export("StringJoiner", StringJoiner);
      NumberParseError = (function($__super) {
        function NumberParseError(message) {
          $traceurRuntime.superConstructor(NumberParseError).call(this);
          this.message = message;
        }
        return ($traceurRuntime.createClass)(NumberParseError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("NumberParseError", NumberParseError);
      NumberWrapper = (function() {
        function NumberWrapper() {}
        return ($traceurRuntime.createClass)(NumberWrapper, {}, {
          toFixed: function(n, fractionDigits) {
            return n.toFixed(fractionDigits);
          },
          equal: function(a, b) {
            return a === b;
          },
          parseIntAutoRadix: function(text) {
            var result = parseInt(text);
            if (isNaN(result)) {
              throw new NumberParseError("Invalid integer literal when parsing " + text);
            }
            return result;
          },
          parseInt: function(text, radix) {
            if (radix == 10) {
              if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else if (radix == 16) {
              if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
              }
            } else {
              var result = parseInt(text, radix);
              if (!isNaN(result)) {
                return result;
              }
            }
            throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " + radix);
          },
          parseFloat: function(text) {
            return parseFloat(text);
          },
          get NaN() {
            return NaN;
          },
          isNaN: function(value) {
            return isNaN(value);
          },
          isInteger: function(value) {
            return Number.isInteger(value);
          }
        });
      }());
      $__export("NumberWrapper", NumberWrapper);
      RegExp = _global.RegExp;
      $__export("RegExp", RegExp);
      RegExpWrapper = (function() {
        function RegExpWrapper() {}
        return ($traceurRuntime.createClass)(RegExpWrapper, {}, {
          create: function(regExpStr) {
            var flags = arguments[1] !== (void 0) ? arguments[1] : '';
            flags = flags.replace(/g/g, '');
            return new _global.RegExp(regExpStr, flags + 'g');
          },
          firstMatch: function(regExp, input) {
            regExp.lastIndex = 0;
            return regExp.exec(input);
          },
          matcher: function(regExp, input) {
            regExp.lastIndex = 0;
            return {
              re: regExp,
              input: input
            };
          }
        });
      }());
      $__export("RegExpWrapper", RegExpWrapper);
      RegExpMatcherWrapper = (function() {
        function RegExpMatcherWrapper() {}
        return ($traceurRuntime.createClass)(RegExpMatcherWrapper, {}, {next: function(matcher) {
            return matcher.re.exec(matcher.input);
          }});
      }());
      $__export("RegExpMatcherWrapper", RegExpMatcherWrapper);
      FunctionWrapper = (function() {
        function FunctionWrapper() {}
        return ($traceurRuntime.createClass)(FunctionWrapper, {}, {apply: function(fn, posArgs) {
            return fn.apply(null, posArgs);
          }});
      }());
      $__export("FunctionWrapper", FunctionWrapper);
      Json = (function() {
        function Json() {}
        return ($traceurRuntime.createClass)(Json, {}, {
          parse: function(s) {
            return _global.JSON.parse(s);
          },
          stringify: function(data) {
            return _global.JSON.stringify(data, null, 2);
          }
        });
      }());
      $__export("Json", Json);
      DateWrapper = (function() {
        function DateWrapper() {}
        return ($traceurRuntime.createClass)(DateWrapper, {}, {
          fromMillis: function(ms) {
            return new Date(ms);
          },
          toMillis: function(date) {
            return date.getTime();
          },
          now: function() {
            return new Date();
          },
          toJson: function(date) {
            return date.toJSON();
          }
        });
      }());
      $__export("DateWrapper", DateWrapper);
    }
  };
});

System.register("angular2/src/facade/collection", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/collection";
  var isJsObject,
      global,
      List,
      Map,
      Set,
      StringMap,
      createMapFromPairs,
      MapWrapper,
      StringMapWrapper,
      ListWrapper,
      SetWrapper;
  function isListLikeIterable(obj) {
    if (!isJsObject(obj))
      return false;
    return ListWrapper.isList(obj) || (!(obj instanceof Map) && Symbol.iterator in obj);
  }
  function iterateListLike(obj, fn) {
    if (ListWrapper.isList(obj)) {
      for (var i = 0; i < obj.length; i++) {
        fn(obj[i]);
      }
    } else {
      var iterator = obj[Symbol.iterator]();
      var item;
      while (!((item = iterator.next()).done)) {
        fn(item.value);
      }
    }
  }
  $__export("isListLikeIterable", isListLikeIterable);
  $__export("iterateListLike", iterateListLike);
  return {
    setters: [function($__m) {
      isJsObject = $__m.isJsObject;
      global = $__m.global;
    }],
    execute: function() {
      List = global.Array;
      $__export("List", List);
      Map = global.Map;
      $__export("Map", Map);
      Set = global.Set;
      $__export("Set", Set);
      StringMap = global.Object;
      $__export("StringMap", StringMap);
      createMapFromPairs = (function() {
        try {
          if (new Map([1, 2]).size === 2) {
            return function createMapFromPairs(pairs) {
              return new Map(pairs);
            };
          }
        } catch (e) {}
        return function createMapAndPopulateFromPairs(pairs) {
          var map = new Map();
          for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            map.set(pair[0], pair[1]);
          }
          return map;
        };
      })();
      MapWrapper = (function() {
        function MapWrapper() {}
        return ($traceurRuntime.createClass)(MapWrapper, {}, {
          create: function() {
            return new Map();
          },
          clone: function(m) {
            return new Map(m);
          },
          createFromStringMap: function(stringMap) {
            var result = MapWrapper.create();
            for (var prop in stringMap) {
              MapWrapper.set(result, prop, stringMap[prop]);
            }
            return result;
          },
          createFromPairs: function(pairs) {
            return createMapFromPairs(pairs);
          },
          get: function(m, k) {
            return m.get(k);
          },
          set: function(m, k, v) {
            m.set(k, v);
          },
          contains: function(m, k) {
            return m.has(k);
          },
          forEach: function(m, fn) {
            m.forEach(fn);
          },
          size: function(m) {
            return m.size;
          },
          delete: function(m, k) {
            m.delete(k);
          },
          clear: function(m) {
            m.clear();
          },
          clearValues: function(m) {
            var keyIterator = m.keys();
            var k;
            while (!((k = keyIterator.next()).done)) {
              m.set(k.value, null);
            }
          },
          iterable: function(m) {
            return m;
          },
          keys: function(m) {
            return m.keys();
          },
          values: function(m) {
            return m.values();
          }
        });
      }());
      $__export("MapWrapper", MapWrapper);
      StringMapWrapper = (function() {
        function StringMapWrapper() {}
        return ($traceurRuntime.createClass)(StringMapWrapper, {}, {
          create: function() {
            return {};
          },
          contains: function(map, key) {
            return map.hasOwnProperty(key);
          },
          get: function(map, key) {
            return map.hasOwnProperty(key) ? map[key] : undefined;
          },
          set: function(map, key, value) {
            map[key] = value;
          },
          keys: function(map) {
            return Object.keys(map);
          },
          isEmpty: function(map) {
            for (var prop in map) {
              return false;
            }
            return true;
          },
          delete: function(map, key) {
            delete map[key];
          },
          forEach: function(map, callback) {
            for (var prop in map) {
              if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
              }
            }
          },
          merge: function(m1, m2) {
            var m = {};
            for (var attr in m1) {
              if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
              }
            }
            for (var attr in m2) {
              if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
              }
            }
            return m;
          },
          equals: function(m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
              return false;
            }
            var key;
            for (var i = 0; i < k1.length; i++) {
              key = k1[i];
              if (m1[key] !== m2[key]) {
                return false;
              }
            }
            return true;
          }
        });
      }());
      $__export("StringMapWrapper", StringMapWrapper);
      ListWrapper = (function() {
        function ListWrapper() {}
        return ($traceurRuntime.createClass)(ListWrapper, {}, {
          create: function() {
            return new List();
          },
          createFixedSize: function(size) {
            return new List(size);
          },
          get: function(m, k) {
            return m[k];
          },
          set: function(m, k, v) {
            m[k] = v;
          },
          clone: function(array) {
            return array.slice(0);
          },
          map: function(array, fn) {
            return array.map(fn);
          },
          forEach: function(array, fn) {
            for (var i = 0; i < array.length; i++) {
              fn(array[i]);
            }
          },
          push: function(array, el) {
            array.push(el);
          },
          first: function(array) {
            if (!array)
              return null;
            return array[0];
          },
          last: function(array) {
            if (!array || array.length == 0)
              return null;
            return array[array.length - 1];
          },
          find: function(list, pred) {
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return list[i];
            }
            return null;
          },
          indexOf: function(array, value) {
            var startIndex = arguments[2] !== (void 0) ? arguments[2] : -1;
            return array.indexOf(value, startIndex);
          },
          reduce: function(list, fn, init) {
            return list.reduce(fn, init);
          },
          filter: function(array, pred) {
            return array.filter(pred);
          },
          any: function(list, pred) {
            for (var i = 0; i < list.length; ++i) {
              if (pred(list[i]))
                return true;
            }
            return false;
          },
          contains: function(list, el) {
            return list.indexOf(el) !== -1;
          },
          reversed: function(array) {
            var a = ListWrapper.clone(array);
            return a.reverse();
          },
          concat: function(a, b) {
            return a.concat(b);
          },
          isList: function(list) {
            return Array.isArray(list);
          },
          insert: function(list, index, value) {
            list.splice(index, 0, value);
          },
          removeAt: function(list, index) {
            var res = list[index];
            list.splice(index, 1);
            return res;
          },
          removeAll: function(list, items) {
            for (var i = 0; i < items.length; ++i) {
              var index = list.indexOf(items[i]);
              list.splice(index, 1);
            }
          },
          removeLast: function(list) {
            return list.pop();
          },
          remove: function(list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
              list.splice(index, 1);
              return true;
            }
            return false;
          },
          clear: function(list) {
            list.splice(0, list.length);
          },
          join: function(list, s) {
            return list.join(s);
          },
          isEmpty: function(list) {
            return list.length == 0;
          },
          fill: function(list, value) {
            var start = arguments[2] !== (void 0) ? arguments[2] : 0;
            var end = arguments[3] !== (void 0) ? arguments[3] : null;
            list.fill(value, start, end === null ? undefined : end);
          },
          equals: function(a, b) {
            if (a.length != b.length)
              return false;
            for (var i = 0; i < a.length; ++i) {
              if (a[i] !== b[i])
                return false;
            }
            return true;
          },
          slice: function(l) {
            var from = arguments[1] !== (void 0) ? arguments[1] : 0;
            var to = arguments[2] !== (void 0) ? arguments[2] : null;
            return l.slice(from, to === null ? undefined : to);
          },
          splice: function(l, from, length) {
            return l.splice(from, length);
          },
          sort: function(l, compareFn) {
            l.sort(compareFn);
          }
        });
      }());
      $__export("ListWrapper", ListWrapper);
      SetWrapper = (function() {
        function SetWrapper() {}
        return ($traceurRuntime.createClass)(SetWrapper, {}, {
          createFromList: function(lst) {
            return new Set(lst);
          },
          has: function(s, key) {
            return s.has(key);
          }
        });
      }());
      $__export("SetWrapper", SetWrapper);
    }
  };
});

System.register("angular2/src/di/annotations_impl", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/annotations_impl";
  var __decorate,
      __metadata,
      CONST,
      Inject,
      InjectPromise,
      InjectLazy,
      Optional,
      DependencyAnnotation,
      Injectable;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Inject = (($traceurRuntime.createClass)(function(token) {
        this.token = token;
      }, {}, {}));
      $__export("Inject", Inject);
      $__export("Inject", Inject = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Inject));
      InjectPromise = (($traceurRuntime.createClass)(function(token) {
        this.token = token;
      }, {}, {}));
      $__export("InjectPromise", InjectPromise);
      $__export("InjectPromise", InjectPromise = __decorate([CONST(), __metadata('design:paramtypes', [Object])], InjectPromise));
      InjectLazy = (($traceurRuntime.createClass)(function(token) {
        this.token = token;
      }, {}, {}));
      $__export("InjectLazy", InjectLazy);
      $__export("InjectLazy", InjectLazy = __decorate([CONST(), __metadata('design:paramtypes', [Object])], InjectLazy));
      Optional = (($traceurRuntime.createClass)(function() {}, {}, {}));
      $__export("Optional", Optional);
      $__export("Optional", Optional = __decorate([CONST(), __metadata('design:paramtypes', [])], Optional));
      DependencyAnnotation = (($traceurRuntime.createClass)(function() {}, {get token() {
          return null;
        }}, {}));
      $__export("DependencyAnnotation", DependencyAnnotation);
      $__export("DependencyAnnotation", DependencyAnnotation = __decorate([CONST(), __metadata('design:paramtypes', [])], DependencyAnnotation));
      Injectable = (($traceurRuntime.createClass)(function() {}, {}, {}));
      $__export("Injectable", Injectable);
      $__export("Injectable", Injectable = __decorate([CONST(), __metadata('design:paramtypes', [])], Injectable));
    }
  };
});

System.register("angular2/src/util/decorators", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/util/decorators";
  var global;
  function makeDecorator(annotationCls) {
    return function() {
      for (var args = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        args[$__0] = arguments[$__0];
      var Reflect = global.Reflect;
      if (!(Reflect && Reflect.getMetadata)) {
        throw 'reflect-metadata shim is required when using class decorators';
      }
      var annotationInstance = Object.create(annotationCls.prototype);
      annotationCls.apply(annotationInstance, args);
      return function(cls) {
        var annotations = Reflect.getMetadata('annotations', cls);
        annotations = annotations || [];
        annotations.push(annotationInstance);
        Reflect.defineMetadata('annotations', annotations, cls);
        return cls;
      };
    };
  }
  function makeParamDecorator(annotationCls) {
    return function() {
      for (var args = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        args[$__0] = arguments[$__0];
      var Reflect = global.Reflect;
      if (!(Reflect && Reflect.getMetadata)) {
        throw 'reflect-metadata shim is required when using parameter decorators';
      }
      var annotationInstance = Object.create(annotationCls.prototype);
      annotationCls.apply(annotationInstance, args);
      return function(cls, unusedKey, index) {
        var parameters = Reflect.getMetadata('parameters', cls);
        parameters = parameters || [];
        while (parameters.length <= index) {
          parameters.push(null);
        }
        parameters[index] = parameters[index] || [];
        var annotationsForParam = parameters[index];
        annotationsForParam.push(annotationInstance);
        Reflect.defineMetadata('parameters', parameters, cls);
        return cls;
      };
    };
  }
  $__export("makeDecorator", makeDecorator);
  $__export("makeParamDecorator", makeParamDecorator);
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/reflection/types", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/types";
  return {
    setters: [],
    execute: function() {
      $__export("SetterFn", Function);
      $__export("GetterFn", Function);
      $__export("MethodFn", Function);
    }
  };
});

System.register("angular2/src/reflection/reflection_capabilities", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflection_capabilities";
  var isPresent,
      global,
      stringify,
      ListWrapper,
      ReflectionCapabilities;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      global = $__m.global;
      stringify = $__m.stringify;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      ReflectionCapabilities = (function() {
        function ReflectionCapabilities(reflect) {
          this._reflect = isPresent(reflect) ? reflect : global.Reflect;
        }
        return ($traceurRuntime.createClass)(ReflectionCapabilities, {
          factory: function(t) {
            switch (t.length) {
              case 0:
                return function() {
                  return new t();
                };
              case 1:
                return function(a1) {
                  return new t(a1);
                };
              case 2:
                return function(a1, a2) {
                  return new t(a1, a2);
                };
              case 3:
                return function(a1, a2, a3) {
                  return new t(a1, a2, a3);
                };
              case 4:
                return function(a1, a2, a3, a4) {
                  return new t(a1, a2, a3, a4);
                };
              case 5:
                return function(a1, a2, a3, a4, a5) {
                  return new t(a1, a2, a3, a4, a5);
                };
              case 6:
                return function(a1, a2, a3, a4, a5, a6) {
                  return new t(a1, a2, a3, a4, a5, a6);
                };
              case 7:
                return function(a1, a2, a3, a4, a5, a6, a7) {
                  return new t(a1, a2, a3, a4, a5, a6, a7);
                };
              case 8:
                return function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8);
                };
              case 9:
                return function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9);
                };
              case 10:
                return function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                  return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                };
            }
            ;
            throw new Error(("Cannot create a factory for '" + stringify(t) + "' because its constructor has more than 10 arguments"));
          },
          _zipTypesAndAnnotaions: function(paramTypes, paramAnnotations) {
            var result;
            if (typeof paramTypes === 'undefined') {
              result = ListWrapper.createFixedSize(paramAnnotations.length);
            } else {
              result = ListWrapper.createFixedSize(paramTypes.length);
            }
            for (var i = 0; i < result.length; i++) {
              if (typeof paramTypes === 'undefined') {
                result[i] = [];
              } else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
              } else {
                result[i] = [];
              }
              if (isPresent(paramAnnotations) && isPresent(paramAnnotations[i])) {
                result[i] = result[i].concat(paramAnnotations[i]);
              }
            }
            return result;
          },
          parameters: function(typeOfFunc) {
            if (isPresent(typeOfFunc.parameters)) {
              return typeOfFunc.parameters;
            }
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
              var paramAnnotations = this._reflect.getMetadata('parameters', typeOfFunc);
              var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOfFunc);
              if (isPresent(paramTypes) || isPresent(paramAnnotations)) {
                return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
              }
            }
            return ListWrapper.createFixedSize(typeOfFunc.length);
          },
          annotations: function(typeOfFunc) {
            if (isPresent(typeOfFunc.annotations)) {
              return typeOfFunc.annotations;
            }
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
              var annotations = this._reflect.getMetadata('annotations', typeOfFunc);
              if (isPresent(annotations))
                return annotations;
            }
            return [];
          },
          getter: function(name) {
            return new Function('o', 'return o.' + name + ';');
          },
          setter: function(name) {
            return new Function('o', 'v', 'return o.' + name + ' = v;');
          },
          method: function(name) {
            var functionBody = ("if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);");
            return new Function('o', 'args', functionBody);
          }
        }, {});
      }());
      $__export("ReflectionCapabilities", ReflectionCapabilities);
    }
  };
});

System.register("angular2/src/change_detection/parser/locals", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/locals";
  var isPresent,
      BaseException,
      MapWrapper,
      Locals;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }],
    execute: function() {
      Locals = (function() {
        function Locals(parent, current) {
          this.parent = parent;
          this.current = current;
        }
        return ($traceurRuntime.createClass)(Locals, {
          contains: function(name) {
            if (MapWrapper.contains(this.current, name)) {
              return true;
            }
            if (isPresent(this.parent)) {
              return this.parent.contains(name);
            }
            return false;
          },
          get: function(name) {
            if (MapWrapper.contains(this.current, name)) {
              return MapWrapper.get(this.current, name);
            }
            if (isPresent(this.parent)) {
              return this.parent.get(name);
            }
            throw new BaseException(("Cannot find '" + name + "'"));
          },
          set: function(name, value) {
            if (MapWrapper.contains(this.current, name)) {
              MapWrapper.set(this.current, name, value);
            } else {
              throw new BaseException('Setting of new keys post-construction is not supported.');
            }
          },
          clearValues: function() {
            MapWrapper.clearValues(this.current);
          }
        }, {});
      }());
      $__export("Locals", Locals);
    }
  };
});

System.register("angular2/src/change_detection/exceptions", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/exceptions";
  var BaseException,
      ExpressionChangedAfterItHasBeenChecked,
      ChangeDetectionError;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ExpressionChangedAfterItHasBeenChecked = (function($__super) {
        function ExpressionChangedAfterItHasBeenChecked(proto, change) {
          $traceurRuntime.superConstructor(ExpressionChangedAfterItHasBeenChecked).call(this);
          this.message = ("Expression '" + proto.expressionAsString + "' has changed after it was checked. ") + ("Previous value: '" + change.previousValue + "'. Current value: '" + change.currentValue + "'");
        }
        return ($traceurRuntime.createClass)(ExpressionChangedAfterItHasBeenChecked, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ExpressionChangedAfterItHasBeenChecked", ExpressionChangedAfterItHasBeenChecked);
      ChangeDetectionError = (function($__super) {
        function ChangeDetectionError(proto, originalException) {
          $traceurRuntime.superConstructor(ChangeDetectionError).call(this);
          this.originalException = originalException;
          this.location = proto.expressionAsString;
          this.message = (this.originalException + " in [" + this.location + "]");
        }
        return ($traceurRuntime.createClass)(ChangeDetectionError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ChangeDetectionError", ChangeDetectionError);
    }
  };
});

System.register("angular2/src/change_detection/interfaces", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/interfaces";
  var ProtoChangeDetector,
      ChangeDetection,
      ChangeDispatcher,
      ChangeDetector,
      ChangeDetectorDefinition;
  return {
    setters: [],
    execute: function() {
      ProtoChangeDetector = (function() {
        function ProtoChangeDetector() {}
        return ($traceurRuntime.createClass)(ProtoChangeDetector, {instantiate: function(dispatcher) {
            return null;
          }}, {});
      }());
      $__export("ProtoChangeDetector", ProtoChangeDetector);
      ChangeDetection = (function() {
        function ChangeDetection() {}
        return ($traceurRuntime.createClass)(ChangeDetection, {createProtoChangeDetector: function(definition) {
            return null;
          }}, {});
      }());
      $__export("ChangeDetection", ChangeDetection);
      ChangeDispatcher = (function() {
        function ChangeDispatcher() {}
        return ($traceurRuntime.createClass)(ChangeDispatcher, {notifyOnBinding: function(bindingRecord, value) {}}, {});
      }());
      $__export("ChangeDispatcher", ChangeDispatcher);
      ChangeDetector = (function() {
        function ChangeDetector() {}
        return ($traceurRuntime.createClass)(ChangeDetector, {
          addChild: function(cd) {},
          addShadowDomChild: function(cd) {},
          removeChild: function(cd) {},
          removeShadowDomChild: function(cd) {},
          remove: function() {},
          hydrate: function(context, locals, directives) {},
          dehydrate: function() {},
          markPathToRootAsCheckOnce: function() {},
          detectChanges: function() {},
          checkNoChanges: function() {}
        }, {});
      }());
      $__export("ChangeDetector", ChangeDetector);
      ChangeDetectorDefinition = (function() {
        function ChangeDetectorDefinition(id, strategy, variableNames, bindingRecords, directiveRecords) {
          this.id = id;
          this.strategy = strategy;
          this.variableNames = variableNames;
          this.bindingRecords = bindingRecords;
          this.directiveRecords = directiveRecords;
        }
        return ($traceurRuntime.createClass)(ChangeDetectorDefinition, {}, {});
      }());
      $__export("ChangeDetectorDefinition", ChangeDetectorDefinition);
    }
  };
});

System.register("angular2/src/change_detection/constants", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/constants";
  var CHECK_ONCE,
      CHECKED,
      CHECK_ALWAYS,
      DETACHED,
      ON_PUSH,
      DEFAULT;
  return {
    setters: [],
    execute: function() {
      CHECK_ONCE = "CHECK_ONCE";
      $__export("CHECK_ONCE", CHECK_ONCE);
      CHECKED = "CHECKED";
      $__export("CHECKED", CHECKED);
      CHECK_ALWAYS = "ALWAYS_CHECK";
      $__export("CHECK_ALWAYS", CHECK_ALWAYS);
      DETACHED = "DETACHED";
      $__export("DETACHED", DETACHED);
      ON_PUSH = "ON_PUSH";
      $__export("ON_PUSH", ON_PUSH);
      DEFAULT = "DEFAULT";
      $__export("DEFAULT", DEFAULT);
    }
  };
});

System.register("angular2/src/change_detection/pipes/pipe", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/pipe";
  var __decorate,
      __metadata,
      BaseException,
      CONST,
      WrappedValue,
      _wrappedValues,
      _wrappedIndex,
      Pipe,
      PipeFactory;
  function _abstract() {
    throw new BaseException('This method is abstract');
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      WrappedValue = (function() {
        function WrappedValue(wrapped) {
          this.wrapped = wrapped;
        }
        return ($traceurRuntime.createClass)(WrappedValue, {}, {wrap: function(value) {
            var w = _wrappedValues[_wrappedIndex++ % 5];
            w.wrapped = value;
            return w;
          }});
      }());
      $__export("WrappedValue", WrappedValue);
      _wrappedValues = [new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null)];
      _wrappedIndex = 0;
      Pipe = (function() {
        function Pipe() {}
        return ($traceurRuntime.createClass)(Pipe, {
          supports: function(obj) {
            return false;
          },
          onDestroy: function() {},
          transform: function(value) {
            return null;
          }
        }, {});
      }());
      $__export("Pipe", Pipe);
      PipeFactory = (($traceurRuntime.createClass)(function() {}, {
        supports: function(obs) {
          _abstract();
          return false;
        },
        create: function(cdRef) {
          _abstract();
          return null;
        }
      }, {}));
      $__export("PipeFactory", PipeFactory);
      $__export("PipeFactory", PipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], PipeFactory));
    }
  };
});

System.register("angular2/src/change_detection/change_detector_ref", ["angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detector_ref";
  var DETACHED,
      CHECK_ALWAYS,
      ChangeDetectorRef;
  return {
    setters: [function($__m) {
      DETACHED = $__m.DETACHED;
      CHECK_ALWAYS = $__m.CHECK_ALWAYS;
    }],
    execute: function() {
      ChangeDetectorRef = (function() {
        function ChangeDetectorRef(_cd) {
          this._cd = _cd;
        }
        return ($traceurRuntime.createClass)(ChangeDetectorRef, {
          requestCheck: function() {
            this._cd.markPathToRootAsCheckOnce();
          },
          detach: function() {
            this._cd.mode = DETACHED;
          },
          reattach: function() {
            this._cd.mode = CHECK_ALWAYS;
            this.requestCheck();
          }
        }, {});
      }());
      $__export("ChangeDetectorRef", ChangeDetectorRef);
    }
  };
});

System.register("angular2/src/change_detection/proto_record", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/proto_record";
  var RECORD_TYPE_SELF,
      RECORD_TYPE_CONST,
      RECORD_TYPE_PRIMITIVE_OP,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_LOCAL,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_KEYED_ACCESS,
      RECORD_TYPE_PIPE,
      RECORD_TYPE_BINDING_PIPE,
      RECORD_TYPE_INTERPOLATE,
      ProtoRecord;
  return {
    setters: [],
    execute: function() {
      RECORD_TYPE_SELF = 0;
      $__export("RECORD_TYPE_SELF", RECORD_TYPE_SELF);
      RECORD_TYPE_CONST = 1;
      $__export("RECORD_TYPE_CONST", RECORD_TYPE_CONST);
      RECORD_TYPE_PRIMITIVE_OP = 2;
      $__export("RECORD_TYPE_PRIMITIVE_OP", RECORD_TYPE_PRIMITIVE_OP);
      RECORD_TYPE_PROPERTY = 3;
      $__export("RECORD_TYPE_PROPERTY", RECORD_TYPE_PROPERTY);
      RECORD_TYPE_LOCAL = 4;
      $__export("RECORD_TYPE_LOCAL", RECORD_TYPE_LOCAL);
      RECORD_TYPE_INVOKE_METHOD = 5;
      $__export("RECORD_TYPE_INVOKE_METHOD", RECORD_TYPE_INVOKE_METHOD);
      RECORD_TYPE_INVOKE_CLOSURE = 6;
      $__export("RECORD_TYPE_INVOKE_CLOSURE", RECORD_TYPE_INVOKE_CLOSURE);
      RECORD_TYPE_KEYED_ACCESS = 7;
      $__export("RECORD_TYPE_KEYED_ACCESS", RECORD_TYPE_KEYED_ACCESS);
      RECORD_TYPE_PIPE = 8;
      $__export("RECORD_TYPE_PIPE", RECORD_TYPE_PIPE);
      RECORD_TYPE_BINDING_PIPE = 9;
      $__export("RECORD_TYPE_BINDING_PIPE", RECORD_TYPE_BINDING_PIPE);
      RECORD_TYPE_INTERPOLATE = 10;
      $__export("RECORD_TYPE_INTERPOLATE", RECORD_TYPE_INTERPOLATE);
      ProtoRecord = (function() {
        function ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, bindingRecord, expressionAsString, lastInBinding, lastInDirective) {
          this.mode = mode;
          this.name = name;
          this.funcOrValue = funcOrValue;
          this.args = args;
          this.fixedArgs = fixedArgs;
          this.contextIndex = contextIndex;
          this.directiveIndex = directiveIndex;
          this.selfIndex = selfIndex;
          this.bindingRecord = bindingRecord;
          this.expressionAsString = expressionAsString;
          this.lastInBinding = lastInBinding;
          this.lastInDirective = lastInDirective;
        }
        return ($traceurRuntime.createClass)(ProtoRecord, {isPureFunction: function() {
            return this.mode === RECORD_TYPE_INTERPOLATE || this.mode === RECORD_TYPE_PRIMITIVE_OP;
          }}, {});
      }());
      $__export("ProtoRecord", ProtoRecord);
    }
  };
});

System.register("angular2/src/change_detection/change_detection_jit_generator", ["angular2/src/facade/lang", "angular2/src/change_detection/abstract_change_detector", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection_jit_generator";
  var BaseException,
      AbstractChangeDetector,
      ChangeDetectionUtil,
      RECORD_TYPE_SELF,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_LOCAL,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_PRIMITIVE_OP,
      RECORD_TYPE_KEYED_ACCESS,
      RECORD_TYPE_PIPE,
      RECORD_TYPE_BINDING_PIPE,
      RECORD_TYPE_INTERPOLATE,
      ABSTRACT_CHANGE_DETECTOR,
      UTIL,
      DISPATCHER_ACCESSOR,
      PIPE_REGISTRY_ACCESSOR,
      PROTOS_ACCESSOR,
      DIRECTIVES_ACCESSOR,
      CONTEXT_ACCESSOR,
      IS_CHANGED_LOCAL,
      CHANGES_LOCAL,
      LOCALS_ACCESSOR,
      MODE_ACCESSOR,
      TEMP_LOCAL,
      CURRENT_PROTO,
      ChangeDetectorJITGenerator;
  function typeTemplate(type, cons, detectChanges, notifyOnAllChangesDone, setContext) {
    return ("\n" + cons + "\n" + detectChanges + "\n" + notifyOnAllChangesDone + "\n" + setContext + ";\n\nreturn function(dispatcher, pipeRegistry) {\n  return new " + type + "(dispatcher, pipeRegistry, protos, directiveRecords);\n}\n");
  }
  function constructorTemplate(type, fieldsDefinitions) {
    return ("\nvar " + type + " = function " + type + "(dispatcher, pipeRegistry, protos, directiveRecords) {\n" + ABSTRACT_CHANGE_DETECTOR + ".call(this);\n" + DISPATCHER_ACCESSOR + " = dispatcher;\n" + PIPE_REGISTRY_ACCESSOR + " = pipeRegistry;\n" + PROTOS_ACCESSOR + " = protos;\n" + DIRECTIVES_ACCESSOR + " = directiveRecords;\n" + LOCALS_ACCESSOR + " = null;\n" + fieldsDefinitions + "\n}\n\n" + type + ".prototype = Object.create(" + ABSTRACT_CHANGE_DETECTOR + ".prototype);\n");
  }
  function pipeOnDestroyTemplate(pipeNames) {
    return pipeNames.map((function(p) {
      return (p + ".onDestroy()");
    })).join("\n");
  }
  function hydrateTemplate(type, mode, fieldDefinitions, pipeOnDestroy, directiveFieldNames, detectorFieldNames) {
    var directiveInit = "";
    for (var i = 0; i < directiveFieldNames.length; ++i) {
      directiveInit += (directiveFieldNames[i] + " = directives.getDirectiveFor(this.directiveRecords[" + i + "].directiveIndex);\n");
    }
    var detectorInit = "";
    for (var i = 0; i < detectorFieldNames.length; ++i) {
      detectorInit += (detectorFieldNames[i] + " = directives.getDetectorFor(this.directiveRecords[" + i + "].directiveIndex);\n");
    }
    return ("\n" + type + ".prototype.hydrate = function(context, locals, directives) {\n  " + MODE_ACCESSOR + " = \"" + mode + "\";\n  " + CONTEXT_ACCESSOR + " = context;\n  " + LOCALS_ACCESSOR + " = locals;\n  " + directiveInit + "\n  " + detectorInit + "\n}\n" + type + ".prototype.dehydrate = function() {\n  " + pipeOnDestroy + "\n  " + fieldDefinitions + "\n  " + LOCALS_ACCESSOR + " = null;\n}\n" + type + ".prototype.hydrated = function() {\n  return " + CONTEXT_ACCESSOR + " !== " + UTIL + ".uninitialized();\n}\n");
  }
  function detectChangesTemplate(type, body) {
    return ("\n" + type + ".prototype.detectChangesInRecords = function(throwOnChange) {\n  " + body + "\n}\n");
  }
  function callOnAllChangesDoneTemplate(type, body) {
    return ("\n" + type + ".prototype.callOnAllChangesDone = function() {\n  " + body + "\n}\n");
  }
  function onAllChangesDoneTemplate(directive) {
    return (directive + ".onAllChangesDone();");
  }
  function detectChangesBodyTemplate(localDefinitions, changeDefinitions, records) {
    return ("\n" + localDefinitions + "\n" + changeDefinitions + "\nvar " + TEMP_LOCAL + ";\nvar " + IS_CHANGED_LOCAL + " = false;\nvar " + CURRENT_PROTO + ";\nvar " + CHANGES_LOCAL + " = null;\n\ncontext = " + CONTEXT_ACCESSOR + ";\n" + records + "\n");
  }
  function pipeCheckTemplate(protoIndex, context, bindingPropagationConfig, pipe, pipeType, oldValue, newValue, change, update, addToChanges, lastInDirective) {
    return ("\n" + CURRENT_PROTO + " = " + PROTOS_ACCESSOR + "[" + protoIndex + "];\nif (" + pipe + " === " + UTIL + ".uninitialized()) {\n  " + pipe + " = " + PIPE_REGISTRY_ACCESSOR + ".get('" + pipeType + "', " + context + ", " + bindingPropagationConfig + ");\n} else if (!" + pipe + ".supports(" + context + ")) {\n  " + pipe + ".onDestroy();\n  " + pipe + " = " + PIPE_REGISTRY_ACCESSOR + ".get('" + pipeType + "', " + context + ", " + bindingPropagationConfig + ");\n}\n\n" + newValue + " = " + pipe + ".transform(" + context + ");\nif (" + oldValue + " !== " + newValue + ") {\n  " + newValue + " = " + UTIL + ".unwrapValue(" + newValue + ");\n  " + change + " = true;\n  " + update + "\n  " + addToChanges + "\n  " + oldValue + " = " + newValue + ";\n}\n" + lastInDirective + "\n");
  }
  function referenceCheckTemplate(protoIndex, assignment, oldValue, newValue, change, update, addToChanges, lastInDirective) {
    return ("\n" + CURRENT_PROTO + " = " + PROTOS_ACCESSOR + "[" + protoIndex + "];\n" + assignment + "\nif (" + newValue + " !== " + oldValue + " || (" + newValue + " !== " + newValue + ") && (" + oldValue + " !== " + oldValue + ")) {\n  " + change + " = true;\n  " + update + "\n  " + addToChanges + "\n  " + oldValue + " = " + newValue + ";\n}\n" + lastInDirective + "\n");
  }
  function assignmentTemplate(field, value) {
    return (field + " = " + value + ";");
  }
  function localDefinitionsTemplate(names) {
    return names.map((function(n) {
      return ("var " + n + ";");
    })).join("\n");
  }
  function changeDefinitionsTemplate(names) {
    return names.map((function(n) {
      return ("var " + n + " = false;");
    })).join("\n");
  }
  function fieldDefinitionsTemplate(names) {
    return names.map((function(n) {
      return (n + " = " + UTIL + ".uninitialized();");
    })).join("\n");
  }
  function ifChangedGuardTemplate(changeNames, body) {
    var cond = changeNames.join(" || ");
    return ("\nif (" + cond + ") {\n  " + body + "\n}\n");
  }
  function addToChangesTemplate(oldValue, newValue) {
    return (CHANGES_LOCAL + " = " + UTIL + ".addChange(" + CHANGES_LOCAL + ", " + CURRENT_PROTO + ".bindingRecord.propertyName, " + UTIL + ".simpleChange(" + oldValue + ", " + newValue + "));");
  }
  function updateDirectiveTemplate(oldValue, newValue, directiveProperty) {
    return ("\nif(throwOnChange) " + UTIL + ".throwOnChange(" + CURRENT_PROTO + ", " + UTIL + ".simpleChange(" + oldValue + ", " + newValue + "));\n" + directiveProperty + " = " + newValue + ";\n" + IS_CHANGED_LOCAL + " = true;\n  ");
  }
  function updateElementTemplate(oldValue, newValue) {
    return ("\nif(throwOnChange) " + UTIL + ".throwOnChange(" + CURRENT_PROTO + ", " + UTIL + ".simpleChange(" + oldValue + ", " + newValue + "));\n" + DISPATCHER_ACCESSOR + ".notifyOnBinding(" + CURRENT_PROTO + ".bindingRecord, " + newValue + ");\n  ");
  }
  function notifyOnChangesTemplate(directive) {
    return ("\nif(" + CHANGES_LOCAL + ") {\n  " + directive + ".onChange(" + CHANGES_LOCAL + ");\n  " + CHANGES_LOCAL + " = null;\n}\n");
  }
  function notifyOnPushDetectorsTemplate(detector) {
    return ("\nif(" + IS_CHANGED_LOCAL + ") {\n  " + detector + ".markAsCheckOnce();\n}\n");
  }
  function lastInDirectiveTemplate(notifyOnChanges, notifyOnPush) {
    return ("\n" + notifyOnChanges + "\n" + notifyOnPush + "\n" + IS_CHANGED_LOCAL + " = false;\n");
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      AbstractChangeDetector = $__m.AbstractChangeDetector;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
    }, function($__m) {
      RECORD_TYPE_SELF = $__m.RECORD_TYPE_SELF;
      RECORD_TYPE_PROPERTY = $__m.RECORD_TYPE_PROPERTY;
      RECORD_TYPE_LOCAL = $__m.RECORD_TYPE_LOCAL;
      RECORD_TYPE_INVOKE_METHOD = $__m.RECORD_TYPE_INVOKE_METHOD;
      RECORD_TYPE_CONST = $__m.RECORD_TYPE_CONST;
      RECORD_TYPE_INVOKE_CLOSURE = $__m.RECORD_TYPE_INVOKE_CLOSURE;
      RECORD_TYPE_PRIMITIVE_OP = $__m.RECORD_TYPE_PRIMITIVE_OP;
      RECORD_TYPE_KEYED_ACCESS = $__m.RECORD_TYPE_KEYED_ACCESS;
      RECORD_TYPE_PIPE = $__m.RECORD_TYPE_PIPE;
      RECORD_TYPE_BINDING_PIPE = $__m.RECORD_TYPE_BINDING_PIPE;
      RECORD_TYPE_INTERPOLATE = $__m.RECORD_TYPE_INTERPOLATE;
    }],
    execute: function() {
      ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
      UTIL = "ChangeDetectionUtil";
      DISPATCHER_ACCESSOR = "this.dispatcher";
      PIPE_REGISTRY_ACCESSOR = "this.pipeRegistry";
      PROTOS_ACCESSOR = "this.protos";
      DIRECTIVES_ACCESSOR = "this.directiveRecords";
      CONTEXT_ACCESSOR = "this.context";
      IS_CHANGED_LOCAL = "isChanged";
      CHANGES_LOCAL = "changes";
      LOCALS_ACCESSOR = "this.locals";
      MODE_ACCESSOR = "this.mode";
      TEMP_LOCAL = "temp";
      CURRENT_PROTO = "currentProto";
      ChangeDetectorJITGenerator = (function() {
        function ChangeDetectorJITGenerator(typeName, changeDetectionStrategy, records, directiveRecords) {
          this.typeName = typeName;
          this.changeDetectionStrategy = changeDetectionStrategy;
          this.records = records;
          this.directiveRecords = directiveRecords;
          this.localNames = this.getLocalNames(records);
          this.changeNames = this.getChangeNames(this.localNames);
          this.fieldNames = this.getFieldNames(this.localNames);
          this.pipeNames = this.getPipeNames(this.localNames);
        }
        return ($traceurRuntime.createClass)(ChangeDetectorJITGenerator, {
          getLocalNames: function(records) {
            var index = 0;
            var names = records.map((function(r) {
              var sanitizedName = r.name.replace(new RegExp("\\W", "g"), '');
              return ("" + sanitizedName + index++);
            }));
            return ["context"].concat(names);
          },
          getChangeNames: function(localNames) {
            return localNames.map((function(n) {
              return ("change_" + n);
            }));
          },
          getFieldNames: function(localNames) {
            return localNames.map((function(n) {
              return ("this." + n);
            }));
          },
          getPipeNames: function(localNames) {
            return localNames.map((function(n) {
              return ("this." + n + "_pipe");
            }));
          },
          generate: function() {
            var text = typeTemplate(this.typeName, this.genConstructor(), this.genDetectChanges(), this.genCallOnAllChangesDone(), this.genHydrate());
            return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos', 'directiveRecords', text)(AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveRecords);
          },
          genConstructor: function() {
            return constructorTemplate(this.typeName, this.genFieldDefinitions());
          },
          genHydrate: function() {
            var mode = ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy);
            return hydrateTemplate(this.typeName, mode, this.genFieldDefinitions(), pipeOnDestroyTemplate(this.getNonNullPipeNames()), this.getDirectiveFieldNames(), this.getDetectorFieldNames());
          },
          getDirectiveFieldNames: function() {
            var $__0 = this;
            return this.directiveRecords.map((function(d) {
              return $__0.getDirective(d.directiveIndex);
            }));
          },
          getDetectorFieldNames: function() {
            var $__0 = this;
            return this.directiveRecords.filter((function(r) {
              return r.isOnPushChangeDetection();
            })).map((function(d) {
              return $__0.getDetector(d.directiveIndex);
            }));
          },
          getDirective: function(d) {
            return ("this.directive_" + d.name);
          },
          getDetector: function(d) {
            return ("this.detector_" + d.name);
          },
          genFieldDefinitions: function() {
            var fields = [];
            fields = fields.concat(this.fieldNames);
            fields = fields.concat(this.getNonNullPipeNames());
            fields = fields.concat(this.getDirectiveFieldNames());
            fields = fields.concat(this.getDetectorFieldNames());
            return fieldDefinitionsTemplate(fields);
          },
          getNonNullPipeNames: function() {
            var $__0 = this;
            var pipes = [];
            this.records.forEach((function(r) {
              if (r.mode === RECORD_TYPE_PIPE || r.mode === RECORD_TYPE_BINDING_PIPE) {
                pipes.push($__0.pipeNames[r.selfIndex]);
              }
            }));
            return pipes;
          },
          genDetectChanges: function() {
            var body = this.genDetectChangesBody();
            return detectChangesTemplate(this.typeName, body);
          },
          genCallOnAllChangesDone: function() {
            var notifications = [];
            var dirs = this.directiveRecords;
            for (var i = dirs.length - 1; i >= 0; --i) {
              var dir = dirs[i];
              if (dir.callOnAllChangesDone) {
                var directive = ("this.directive_" + dir.directiveIndex.name);
                notifications.push(onAllChangesDoneTemplate(directive));
              }
            }
            return callOnAllChangesDoneTemplate(this.typeName, notifications.join(";\n"));
          },
          genDetectChangesBody: function() {
            var $__0 = this;
            var rec = this.records.map((function(r) {
              return $__0.genRecord(r);
            })).join("\n");
            return detectChangesBodyTemplate(this.genLocalDefinitions(), this.genChangeDefinitions(), rec);
          },
          genLocalDefinitions: function() {
            return localDefinitionsTemplate(this.localNames);
          },
          genChangeDefinitions: function() {
            return changeDefinitionsTemplate(this.changeNames);
          },
          genRecord: function(r) {
            if (r.mode === RECORD_TYPE_PIPE || r.mode === RECORD_TYPE_BINDING_PIPE) {
              return this.genPipeCheck(r);
            } else {
              return this.genReferenceCheck(r);
            }
          },
          genPipeCheck: function(r) {
            var context = this.localNames[r.contextIndex];
            var oldValue = this.fieldNames[r.selfIndex];
            var newValue = this.localNames[r.selfIndex];
            var change = this.changeNames[r.selfIndex];
            var pipe = this.pipeNames[r.selfIndex];
            var cdRef = r.mode === RECORD_TYPE_BINDING_PIPE ? "this.ref" : "null";
            var update = this.genUpdateDirectiveOrElement(r);
            var addToChanges = this.genAddToChanges(r);
            var lastInDirective = this.genLastInDirective(r);
            return pipeCheckTemplate(r.selfIndex - 1, context, cdRef, pipe, r.name, oldValue, newValue, change, update, addToChanges, lastInDirective);
          },
          genReferenceCheck: function(r) {
            var oldValue = this.fieldNames[r.selfIndex];
            var newValue = this.localNames[r.selfIndex];
            var change = this.changeNames[r.selfIndex];
            var assignment = this.genUpdateCurrentValue(r);
            var update = this.genUpdateDirectiveOrElement(r);
            var addToChanges = this.genAddToChanges(r);
            var lastInDirective = this.genLastInDirective(r);
            var check = referenceCheckTemplate(r.selfIndex - 1, assignment, oldValue, newValue, change, update, addToChanges, lastInDirective);
            if (r.isPureFunction()) {
              return this.ifChangedGuard(r, check);
            } else {
              return check;
            }
          },
          genUpdateCurrentValue: function(r) {
            var context = this.getContext(r);
            var newValue = this.localNames[r.selfIndex];
            var args = this.genArgs(r);
            switch (r.mode) {
              case RECORD_TYPE_SELF:
                return assignmentTemplate(newValue, context);
              case RECORD_TYPE_CONST:
                return (newValue + " = " + this.genLiteral(r.funcOrValue));
              case RECORD_TYPE_PROPERTY:
                return assignmentTemplate(newValue, (context + "." + r.name));
              case RECORD_TYPE_LOCAL:
                return assignmentTemplate(newValue, (LOCALS_ACCESSOR + ".get('" + r.name + "')"));
              case RECORD_TYPE_INVOKE_METHOD:
                return assignmentTemplate(newValue, (context + "." + r.name + "(" + args + ")"));
              case RECORD_TYPE_INVOKE_CLOSURE:
                return assignmentTemplate(newValue, (context + "(" + args + ")"));
              case RECORD_TYPE_PRIMITIVE_OP:
                return assignmentTemplate(newValue, (UTIL + "." + r.name + "(" + args + ")"));
              case RECORD_TYPE_INTERPOLATE:
                return assignmentTemplate(newValue, this.genInterpolation(r));
              case RECORD_TYPE_KEYED_ACCESS:
                var key = this.localNames[r.args[0]];
                return assignmentTemplate(newValue, (context + "[" + key + "]"));
              default:
                throw new BaseException(("Unknown operation " + r.mode));
            }
          },
          getContext: function(r) {
            if (r.contextIndex == -1) {
              return this.getDirective(r.directiveIndex);
            } else {
              return this.localNames[r.contextIndex];
            }
          },
          ifChangedGuard: function(r, body) {
            var $__0 = this;
            return ifChangedGuardTemplate(r.args.map((function(a) {
              return $__0.changeNames[a];
            })), body);
          },
          genInterpolation: function(r) {
            var res = "";
            for (var i = 0; i < r.args.length; ++i) {
              res += this.genLiteral(r.fixedArgs[i]);
              res += " + ";
              res += this.localNames[r.args[i]];
              res += " + ";
            }
            res += this.genLiteral(r.fixedArgs[r.args.length]);
            return res;
          },
          genLiteral: function(value) {
            return JSON.stringify(value);
          },
          genUpdateDirectiveOrElement: function(r) {
            if (!r.lastInBinding)
              return "";
            var newValue = this.localNames[r.selfIndex];
            var oldValue = this.fieldNames[r.selfIndex];
            var br = r.bindingRecord;
            if (br.isDirective()) {
              var directiveProperty = (this.getDirective(br.directiveRecord.directiveIndex) + "." + br.propertyName);
              return updateDirectiveTemplate(oldValue, newValue, directiveProperty);
            } else {
              return updateElementTemplate(oldValue, newValue);
            }
          },
          genAddToChanges: function(r) {
            var newValue = this.localNames[r.selfIndex];
            var oldValue = this.fieldNames[r.selfIndex];
            return r.bindingRecord.callOnChange() ? addToChangesTemplate(oldValue, newValue) : "";
          },
          genLastInDirective: function(r) {
            var onChanges = this.genNotifyOnChanges(r);
            var onPush = this.genNotifyOnPushDetectors(r);
            return lastInDirectiveTemplate(onChanges, onPush);
          },
          genNotifyOnChanges: function(r) {
            var br = r.bindingRecord;
            if (r.lastInDirective && br.callOnChange()) {
              return notifyOnChangesTemplate(this.getDirective(br.directiveRecord.directiveIndex));
            } else {
              return "";
            }
          },
          genNotifyOnPushDetectors: function(r) {
            var br = r.bindingRecord;
            if (r.lastInDirective && br.isOnPushChangeDetection()) {
              return notifyOnPushDetectorsTemplate(this.getDetector(br.directiveRecord.directiveIndex));
            } else {
              return "";
            }
          },
          genArgs: function(r) {
            var $__0 = this;
            return r.args.map((function(arg) {
              return $__0.localNames[arg];
            })).join(", ");
          }
        }, {});
      }());
      $__export("ChangeDetectorJITGenerator", ChangeDetectorJITGenerator);
    }
  };
});

System.register("angular2/src/change_detection/directive_record", ["angular2/src/change_detection/constants", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/directive_record";
  var ON_PUSH,
      StringWrapper,
      DirectiveIndex,
      DirectiveRecord;
  return {
    setters: [function($__m) {
      ON_PUSH = $__m.ON_PUSH;
    }, function($__m) {
      StringWrapper = $__m.StringWrapper;
    }],
    execute: function() {
      DirectiveIndex = (function() {
        function DirectiveIndex(elementIndex, directiveIndex) {
          this.elementIndex = elementIndex;
          this.directiveIndex = directiveIndex;
        }
        return ($traceurRuntime.createClass)(DirectiveIndex, {get name() {
            return (this.elementIndex + "_" + this.directiveIndex);
          }}, {});
      }());
      $__export("DirectiveIndex", DirectiveIndex);
      DirectiveRecord = (function() {
        function DirectiveRecord(directiveIndex, callOnAllChangesDone, callOnChange, changeDetection) {
          this.directiveIndex = directiveIndex;
          this.callOnAllChangesDone = callOnAllChangesDone;
          this.callOnChange = callOnChange;
          this.changeDetection = changeDetection;
        }
        return ($traceurRuntime.createClass)(DirectiveRecord, {isOnPushChangeDetection: function() {
            return StringWrapper.equals(this.changeDetection, ON_PUSH);
          }}, {});
      }());
      $__export("DirectiveRecord", DirectiveRecord);
    }
  };
});

System.register("angular2/src/change_detection/coalesce", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/coalesce";
  var isPresent,
      ListWrapper,
      MapWrapper,
      RECORD_TYPE_SELF,
      ProtoRecord;
  function coalesce(records) {
    var res = ListWrapper.create();
    var indexMap = MapWrapper.create();
    for (var i = 0; i < records.length; ++i) {
      var r = records[i];
      var record = _replaceIndices(r, res.length + 1, indexMap);
      var matchingRecord = _findMatching(record, res);
      if (isPresent(matchingRecord) && record.lastInBinding) {
        ListWrapper.push(res, _selfRecord(record, matchingRecord.selfIndex, res.length + 1));
        MapWrapper.set(indexMap, r.selfIndex, matchingRecord.selfIndex);
      } else if (isPresent(matchingRecord) && !record.lastInBinding) {
        MapWrapper.set(indexMap, r.selfIndex, matchingRecord.selfIndex);
      } else {
        ListWrapper.push(res, record);
        MapWrapper.set(indexMap, r.selfIndex, record.selfIndex);
      }
    }
    return res;
  }
  function _selfRecord(r, contextIndex, selfIndex) {
    return new ProtoRecord(RECORD_TYPE_SELF, "self", null, [], r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective);
  }
  function _findMatching(r, rs) {
    return ListWrapper.find(rs, (function(rr) {
      return rr.mode === r.mode && rr.funcOrValue === r.funcOrValue && rr.contextIndex === r.contextIndex && ListWrapper.equals(rr.args, r.args);
    }));
  }
  function _replaceIndices(r, selfIndex, indexMap) {
    var args = ListWrapper.map(r.args, (function(a) {
      return _map(indexMap, a);
    }));
    var contextIndex = _map(indexMap, r.contextIndex);
    return new ProtoRecord(r.mode, r.name, r.funcOrValue, args, r.fixedArgs, contextIndex, r.directiveIndex, selfIndex, r.bindingRecord, r.expressionAsString, r.lastInBinding, r.lastInDirective);
  }
  function _map(indexMap, value) {
    var r = MapWrapper.get(indexMap, value);
    return isPresent(r) ? r : value;
  }
  $__export("coalesce", coalesce);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      RECORD_TYPE_SELF = $__m.RECORD_TYPE_SELF;
      ProtoRecord = $__m.ProtoRecord;
    }],
    execute: function() {
    }
  };
});

System.register("angular2/src/change_detection/binding_record", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/binding_record";
  var isPresent,
      DIRECTIVE,
      ELEMENT,
      TEXT_NODE,
      BindingRecord;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      DIRECTIVE = "directive";
      ELEMENT = "element";
      TEXT_NODE = "textNode";
      BindingRecord = (function() {
        function BindingRecord(mode, implicitReceiver, ast, elementIndex, propertyName, setter, directiveRecord) {
          this.mode = mode;
          this.implicitReceiver = implicitReceiver;
          this.ast = ast;
          this.elementIndex = elementIndex;
          this.propertyName = propertyName;
          this.setter = setter;
          this.directiveRecord = directiveRecord;
        }
        return ($traceurRuntime.createClass)(BindingRecord, {
          callOnChange: function() {
            return isPresent(this.directiveRecord) && this.directiveRecord.callOnChange;
          },
          isOnPushChangeDetection: function() {
            return isPresent(this.directiveRecord) && this.directiveRecord.isOnPushChangeDetection();
          },
          isDirective: function() {
            return this.mode === DIRECTIVE;
          },
          isElement: function() {
            return this.mode === ELEMENT;
          },
          isTextNode: function() {
            return this.mode === TEXT_NODE;
          }
        }, {
          createForDirective: function(ast, propertyName, setter, directiveRecord) {
            return new BindingRecord(DIRECTIVE, 0, ast, 0, propertyName, setter, directiveRecord);
          },
          createForElement: function(ast, elementIndex, propertyName) {
            return new BindingRecord(ELEMENT, 0, ast, elementIndex, propertyName, null, null);
          },
          createForHostProperty: function(directiveIndex, ast, propertyName) {
            return new BindingRecord(ELEMENT, directiveIndex, ast, directiveIndex.elementIndex, propertyName, null, null);
          },
          createForTextNode: function(ast, elementIndex) {
            return new BindingRecord(TEXT_NODE, 0, ast, elementIndex, null, null, null);
          }
        });
      }());
      $__export("BindingRecord", BindingRecord);
    }
  };
});

System.register("angular2/src/change_detection/pipes/pipe_registry", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/di/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/pipe_registry";
  var __decorate,
      __metadata,
      ListWrapper,
      isBlank,
      BaseException,
      Injectable,
      PipeRegistry;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      PipeRegistry = (($traceurRuntime.createClass)(function(config) {
        this.config = config;
      }, {get: function(type, obj, cdRef) {
          var listOfConfigs = this.config[type];
          if (isBlank(listOfConfigs)) {
            throw new BaseException(("Cannot find '" + type + "' pipe supporting object '" + obj + "'"));
          }
          var matchingConfig = ListWrapper.find(listOfConfigs, (function(pipeConfig) {
            return pipeConfig.supports(obj);
          }));
          if (isBlank(matchingConfig)) {
            throw new BaseException(("Cannot find '" + type + "' pipe supporting object '" + obj + "'"));
          }
          return matchingConfig.create(cdRef);
        }}, {}));
      $__export("PipeRegistry", PipeRegistry);
      $__export("PipeRegistry", PipeRegistry = __decorate([Injectable(), __metadata('design:paramtypes', [Object])], PipeRegistry));
    }
  };
});

System.register("angular2/src/change_detection/pipes/null_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/null_pipe";
  var __decorate,
      __metadata,
      isBlank,
      CONST,
      Pipe,
      WrappedValue,
      PipeFactory,
      NullPipeFactory,
      NullPipe;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      CONST = $__m.CONST;
    }, function($__m) {
      Pipe = $__m.Pipe;
      WrappedValue = $__m.WrappedValue;
      PipeFactory = $__m.PipeFactory;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NullPipeFactory = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this);
        }
        return ($traceurRuntime.createClass)($__0, {
          supports: function(obj) {
            return NullPipe.supportsObj(obj);
          },
          create: function(cdRef) {
            return new NullPipe();
          }
        }, {}, $__super);
      }(PipeFactory));
      $__export("NullPipeFactory", NullPipeFactory);
      $__export("NullPipeFactory", NullPipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], NullPipeFactory));
      NullPipe = (function($__super) {
        function NullPipe() {
          $traceurRuntime.superConstructor(NullPipe).call(this);
          this.called = false;
        }
        return ($traceurRuntime.createClass)(NullPipe, {
          supports: function(obj) {
            return NullPipe.supportsObj(obj);
          },
          transform: function(value) {
            if (!this.called) {
              this.called = true;
              return WrappedValue.wrap(null);
            } else {
              return null;
            }
          }
        }, {supportsObj: function(obj) {
            return isBlank(obj);
          }}, $__super);
      }(Pipe));
      $__export("NullPipe", NullPipe);
    }
  };
});

System.register("angular2/src/change_detection/pipes/iterable_changes", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/iterable_changes";
  var __decorate,
      __metadata,
      CONST,
      isListLikeIterable,
      iterateListLike,
      ListWrapper,
      MapWrapper,
      isBlank,
      isPresent,
      stringify,
      getMapKey,
      looseIdentical,
      WrappedValue,
      Pipe,
      PipeFactory,
      IterableChangesFactory,
      IterableChanges,
      CollectionChangeRecord,
      _DuplicateItemRecordList,
      _DuplicateMap;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      stringify = $__m.stringify;
      getMapKey = $__m.getMapKey;
      looseIdentical = $__m.looseIdentical;
    }, function($__m) {
      isListLikeIterable = $__m.isListLikeIterable;
      iterateListLike = $__m.iterateListLike;
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
      Pipe = $__m.Pipe;
      PipeFactory = $__m.PipeFactory;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      IterableChangesFactory = (function($__super) {
        function $__1() {
          $traceurRuntime.superConstructor($__1).call(this);
        }
        return ($traceurRuntime.createClass)($__1, {
          supports: function(obj) {
            return IterableChanges.supportsObj(obj);
          },
          create: function(cdRef) {
            return new IterableChanges();
          }
        }, {}, $__super);
      }(PipeFactory));
      $__export("IterableChangesFactory", IterableChangesFactory);
      $__export("IterableChangesFactory", IterableChangesFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], IterableChangesFactory));
      IterableChanges = (function($__super) {
        function IterableChanges() {
          $traceurRuntime.superConstructor(IterableChanges).call(this);
          this._collection = null;
          this._length = null;
          this._linkedRecords = null;
          this._unlinkedRecords = null;
          this._previousItHead = null;
          this._itHead = null;
          this._itTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._movesHead = null;
          this._movesTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        }
        return ($traceurRuntime.createClass)(IterableChanges, {
          supports: function(obj) {
            return IterableChanges.supportsObj(obj);
          },
          get collection() {
            return this._collection;
          },
          get length() {
            return this._length;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachMovedItem: function(fn) {
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          transform: function(collection) {
            if (this.check(collection)) {
              return WrappedValue.wrap(this);
            } else {
              return this;
            }
          },
          check: function(collection) {
            var $__0 = this;
            this._reset();
            var record = this._itHead;
            var mayBeDirty = false;
            var index;
            var item;
            if (ListWrapper.isList(collection)) {
              var list = collection;
              this._length = collection.length;
              for (index = 0; index < this._length; index++) {
                item = list[index];
                if (record === null || !looseIdentical(record.item, item)) {
                  record = this._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = this._verifyReinsertion(record, item, index);
                }
                record = record._next;
              }
            } else {
              index = 0;
              iterateListLike(collection, (function(item) {
                if (record === null || !looseIdentical(record.item, item)) {
                  record = $__0._mismatch(record, item, index);
                  mayBeDirty = true;
                } else if (mayBeDirty) {
                  record = $__0._verifyReinsertion(record, item, index);
                }
                record = record._next;
                index++;
              }));
              this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return this.isDirty;
          },
          get isDirty() {
            return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null;
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              var nextRecord;
              for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
              }
              this._additionsHead = this._additionsTail = null;
              for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
              }
              this._movesHead = this._movesTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _mismatch: function(record, item, index) {
            var previousRecord;
            if (record === null) {
              previousRecord = this._itTail;
            } else {
              previousRecord = record._prev;
              this._remove(record);
            }
            record = this._linkedRecords === null ? null : this._linkedRecords.get(item, index);
            if (record !== null) {
              this._moveAfter(record, previousRecord, index);
            } else {
              record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
              if (record !== null) {
                this._reinsertAfter(record, previousRecord, index);
              } else {
                record = this._addAfter(new CollectionChangeRecord(item), previousRecord, index);
              }
            }
            return record;
          },
          _verifyReinsertion: function(record, item, index) {
            var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(item);
            if (reinsertRecord !== null) {
              record = this._reinsertAfter(reinsertRecord, record._prev, index);
            } else if (record.currentIndex != index) {
              record.currentIndex = index;
              this._addToMoves(record, index);
            }
            return record;
          },
          _truncate: function(record) {
            while (record !== null) {
              var nextRecord = record._next;
              this._addToRemovals(this._unlink(record));
              record = nextRecord;
            }
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.clear();
            }
            if (this._additionsTail !== null) {
              this._additionsTail._nextAdded = null;
            }
            if (this._movesTail !== null) {
              this._movesTail._nextMoved = null;
            }
            if (this._itTail !== null) {
              this._itTail._next = null;
            }
            if (this._removalsTail !== null) {
              this._removalsTail._nextRemoved = null;
            }
          },
          _reinsertAfter: function(record, prevRecord, index) {
            if (this._unlinkedRecords !== null) {
              this._unlinkedRecords.remove(record);
            }
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
          },
          _moveAfter: function(record, prevRecord, index) {
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
          },
          _addAfter: function(record, prevRecord, index) {
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
              this._additionsTail = this._additionsHead = record;
            } else {
              this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return record;
          },
          _insertAfter: function(record, prevRecord, index) {
            var next = prevRecord === null ? this._itHead : prevRecord._next;
            record._next = next;
            record._prev = prevRecord;
            if (next === null) {
              this._itTail = record;
            } else {
              next._prev = record;
            }
            if (prevRecord === null) {
              this._itHead = record;
            } else {
              prevRecord._next = record;
            }
            if (this._linkedRecords === null) {
              this._linkedRecords = new _DuplicateMap();
            }
            this._linkedRecords.put(record);
            record.currentIndex = index;
            return record;
          },
          _remove: function(record) {
            return this._addToRemovals(this._unlink(record));
          },
          _unlink: function(record) {
            if (this._linkedRecords !== null) {
              this._linkedRecords.remove(record);
            }
            var prev = record._prev;
            var next = record._next;
            if (prev === null) {
              this._itHead = next;
            } else {
              prev._next = next;
            }
            if (next === null) {
              this._itTail = prev;
            } else {
              next._prev = prev;
            }
            return record;
          },
          _addToMoves: function(record, toIndex) {
            if (record.previousIndex === toIndex) {
              return record;
            }
            if (this._movesTail === null) {
              this._movesTail = this._movesHead = record;
            } else {
              this._movesTail = this._movesTail._nextMoved = record;
            }
            return record;
          },
          _addToRemovals: function(record) {
            if (this._unlinkedRecords === null) {
              this._unlinkedRecords = new _DuplicateMap();
            }
            this._unlinkedRecords.put(record);
            record.currentIndex = null;
            record._nextRemoved = null;
            if (this._removalsTail === null) {
              this._removalsTail = this._removalsHead = record;
              record._prevRemoved = null;
            } else {
              record._prevRemoved = this._removalsTail;
              this._removalsTail = this._removalsTail._nextRemoved = record;
            }
            return record;
          },
          toString: function() {
            var record;
            var list = [];
            for (record = this._itHead; record !== null; record = record._next) {
              ListWrapper.push(list, record);
            }
            var previous = [];
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
              ListWrapper.push(previous, record);
            }
            var additions = [];
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              ListWrapper.push(additions, record);
            }
            var moves = [];
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
              ListWrapper.push(moves, record);
            }
            var removals = [];
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              ListWrapper.push(removals, record);
            }
            return "collection: " + list.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "moves: " + moves.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          }
        }, {supportsObj: function(obj) {
            return isListLikeIterable(obj);
          }}, $__super);
      }(Pipe));
      $__export("IterableChanges", IterableChanges);
      CollectionChangeRecord = (function() {
        function CollectionChangeRecord(item) {
          this.currentIndex = null;
          this.previousIndex = null;
          this.item = item;
          this._nextPrevious = null;
          this._prev = null;
          this._next = null;
          this._prevDup = null;
          this._nextDup = null;
          this._prevRemoved = null;
          this._nextRemoved = null;
          this._nextAdded = null;
          this._nextMoved = null;
        }
        return ($traceurRuntime.createClass)(CollectionChangeRecord, {toString: function() {
            return this.previousIndex === this.currentIndex ? stringify(this.item) : stringify(this.item) + '[' + stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']';
          }}, {});
      }());
      $__export("CollectionChangeRecord", CollectionChangeRecord);
      _DuplicateItemRecordList = (function() {
        function _DuplicateItemRecordList() {
          this._head = null;
          this._tail = null;
        }
        return ($traceurRuntime.createClass)(_DuplicateItemRecordList, {
          add: function(record) {
            if (this._head === null) {
              this._head = this._tail = record;
              record._nextDup = null;
              record._prevDup = null;
            } else {
              this._tail._nextDup = record;
              record._prevDup = this._tail;
              record._nextDup = null;
              this._tail = record;
            }
          },
          get: function(item, afterIndex) {
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
              if ((afterIndex === null || afterIndex < record.currentIndex) && looseIdentical(record.item, item)) {
                return record;
              }
            }
            return null;
          },
          remove: function(record) {
            var prev = record._prevDup;
            var next = record._nextDup;
            if (prev === null) {
              this._head = next;
            } else {
              prev._nextDup = next;
            }
            if (next === null) {
              this._tail = prev;
            } else {
              next._prevDup = prev;
            }
            return this._head === null;
          }
        }, {});
      }());
      _DuplicateMap = (function() {
        function _DuplicateMap() {
          this.map = MapWrapper.create();
        }
        return ($traceurRuntime.createClass)(_DuplicateMap, {
          put: function(record) {
            var key = getMapKey(record.item);
            var duplicates = MapWrapper.get(this.map, key);
            if (!isPresent(duplicates)) {
              duplicates = new _DuplicateItemRecordList();
              MapWrapper.set(this.map, key, duplicates);
            }
            duplicates.add(record);
          },
          get: function(value) {
            var afterIndex = arguments[1] !== (void 0) ? arguments[1] : null;
            var key = getMapKey(value);
            var recordList = MapWrapper.get(this.map, key);
            return isBlank(recordList) ? null : recordList.get(value, afterIndex);
          },
          remove: function(record) {
            var key = getMapKey(record.item);
            var recordList = MapWrapper.get(this.map, key);
            if (recordList.remove(record)) {
              MapWrapper.delete(this.map, key);
            }
            return record;
          },
          get isEmpty() {
            return MapWrapper.size(this.map) === 0;
          },
          clear: function() {
            MapWrapper.clear(this.map);
          },
          toString: function() {
            return '_DuplicateMap(' + stringify(this.map) + ')';
          }
        }, {});
      }());
    }
  };
});

System.register("angular2/src/change_detection/pipes/keyvalue_changes", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/keyvalue_changes";
  var __decorate,
      __metadata,
      ListWrapper,
      MapWrapper,
      StringMapWrapper,
      stringify,
      looseIdentical,
      isJsObject,
      CONST,
      WrappedValue,
      Pipe,
      PipeFactory,
      KeyValueChangesFactory,
      KeyValueChanges,
      KVChangeRecord;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      looseIdentical = $__m.looseIdentical;
      isJsObject = $__m.isJsObject;
      CONST = $__m.CONST;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
      Pipe = $__m.Pipe;
      PipeFactory = $__m.PipeFactory;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      KeyValueChangesFactory = (function($__super) {
        function $__1() {
          $traceurRuntime.superConstructor($__1).call(this);
        }
        return ($traceurRuntime.createClass)($__1, {
          supports: function(obj) {
            return KeyValueChanges.supportsObj(obj);
          },
          create: function(cdRef) {
            return new KeyValueChanges();
          }
        }, {}, $__super);
      }(PipeFactory));
      $__export("KeyValueChangesFactory", KeyValueChangesFactory);
      $__export("KeyValueChangesFactory", KeyValueChangesFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], KeyValueChangesFactory));
      KeyValueChanges = (function($__super) {
        function KeyValueChanges() {
          $traceurRuntime.superConstructor(KeyValueChanges).call(this);
          this._records = MapWrapper.create();
          this._mapHead = null;
          this._previousMapHead = null;
          this._changesHead = null;
          this._changesTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        }
        return ($traceurRuntime.createClass)(KeyValueChanges, {
          supports: function(obj) {
            return KeyValueChanges.supportsObj(obj);
          },
          transform: function(map) {
            if (this.check(map)) {
              return WrappedValue.wrap(this);
            } else {
              return this;
            }
          },
          get isDirty() {
            return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
          },
          forEachItem: function(fn) {
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              fn(record);
            }
          },
          forEachPreviousItem: function(fn) {
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              fn(record);
            }
          },
          forEachChangedItem: function(fn) {
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              fn(record);
            }
          },
          forEachAddedItem: function(fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              fn(record);
            }
          },
          forEachRemovedItem: function(fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              fn(record);
            }
          },
          check: function(map) {
            var $__0 = this;
            this._reset();
            var records = this._records;
            var oldSeqRecord = this._mapHead;
            var lastOldSeqRecord = null;
            var lastNewSeqRecord = null;
            var seqChanged = false;
            this._forEach(map, (function(value, key) {
              var newSeqRecord;
              if (oldSeqRecord !== null && key === oldSeqRecord.key) {
                newSeqRecord = oldSeqRecord;
                if (!looseIdentical(value, oldSeqRecord.currentValue)) {
                  oldSeqRecord.previousValue = oldSeqRecord.currentValue;
                  oldSeqRecord.currentValue = value;
                  $__0._addToChanges(oldSeqRecord);
                }
              } else {
                seqChanged = true;
                if (oldSeqRecord !== null) {
                  oldSeqRecord._next = null;
                  $__0._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                  $__0._addToRemovals(oldSeqRecord);
                }
                if (MapWrapper.contains(records, key)) {
                  newSeqRecord = MapWrapper.get(records, key);
                } else {
                  newSeqRecord = new KVChangeRecord(key);
                  MapWrapper.set(records, key, newSeqRecord);
                  newSeqRecord.currentValue = value;
                  $__0._addToAdditions(newSeqRecord);
                }
              }
              if (seqChanged) {
                if ($__0._isInRemovals(newSeqRecord)) {
                  $__0._removeFromRemovals(newSeqRecord);
                }
                if (lastNewSeqRecord == null) {
                  $__0._mapHead = newSeqRecord;
                } else {
                  lastNewSeqRecord._next = newSeqRecord;
                }
              }
              lastOldSeqRecord = oldSeqRecord;
              lastNewSeqRecord = newSeqRecord;
              oldSeqRecord = oldSeqRecord === null ? null : oldSeqRecord._next;
            }));
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return this.isDirty;
          },
          _reset: function() {
            if (this.isDirty) {
              var record;
              for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
              }
              for (record = this._changesHead; record !== null; record = record._nextChanged) {
                record.previousValue = record.currentValue;
              }
              for (record = this._additionsHead; record != null; record = record._nextAdded) {
                record.previousValue = record.currentValue;
              }
              this._changesHead = this._changesTail = null;
              this._additionsHead = this._additionsTail = null;
              this._removalsHead = this._removalsTail = null;
            }
          },
          _truncate: function(lastRecord, record) {
            while (record !== null) {
              if (lastRecord === null) {
                this._mapHead = null;
              } else {
                lastRecord._next = null;
              }
              var nextRecord = record._next;
              this._addToRemovals(record);
              lastRecord = record;
              record = nextRecord;
            }
            for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
              rec.previousValue = rec.currentValue;
              rec.currentValue = null;
              MapWrapper.delete(this._records, rec.key);
            }
          },
          _isInRemovals: function(record) {
            return record === this._removalsHead || record._nextRemoved !== null || record._prevRemoved !== null;
          },
          _addToRemovals: function(record) {
            if (this._removalsHead === null) {
              this._removalsHead = this._removalsTail = record;
            } else {
              this._removalsTail._nextRemoved = record;
              record._prevRemoved = this._removalsTail;
              this._removalsTail = record;
            }
          },
          _removeFromSeq: function(prev, record) {
            var next = record._next;
            if (prev === null) {
              this._mapHead = next;
            } else {
              prev._next = next;
            }
          },
          _removeFromRemovals: function(record) {
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
              this._removalsHead = next;
            } else {
              prev._nextRemoved = next;
            }
            if (next === null) {
              this._removalsTail = prev;
            } else {
              next._prevRemoved = prev;
            }
            record._prevRemoved = record._nextRemoved = null;
          },
          _addToAdditions: function(record) {
            if (this._additionsHead === null) {
              this._additionsHead = this._additionsTail = record;
            } else {
              this._additionsTail._nextAdded = record;
              this._additionsTail = record;
            }
          },
          _addToChanges: function(record) {
            if (this._changesHead === null) {
              this._changesHead = this._changesTail = record;
            } else {
              this._changesTail._nextChanged = record;
              this._changesTail = record;
            }
          },
          toString: function() {
            var items = [];
            var previous = [];
            var changes = [];
            var additions = [];
            var removals = [];
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
              ListWrapper.push(items, stringify(record));
            }
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
              ListWrapper.push(previous, stringify(record));
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              ListWrapper.push(changes, stringify(record));
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              ListWrapper.push(additions, stringify(record));
            }
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
              ListWrapper.push(removals, stringify(record));
            }
            return "map: " + items.join(', ') + "\n" + "previous: " + previous.join(', ') + "\n" + "additions: " + additions.join(', ') + "\n" + "changes: " + changes.join(', ') + "\n" + "removals: " + removals.join(', ') + "\n";
          },
          _forEach: function(obj, fn) {
            if (obj instanceof Map) {
              MapWrapper.forEach(obj, fn);
            } else {
              StringMapWrapper.forEach(obj, fn);
            }
          }
        }, {supportsObj: function(obj) {
            return obj instanceof Map || isJsObject(obj);
          }}, $__super);
      }(Pipe));
      $__export("KeyValueChanges", KeyValueChanges);
      KVChangeRecord = (function() {
        function KVChangeRecord(key) {
          this.key = key;
          this.previousValue = null;
          this.currentValue = null;
          this._nextPrevious = null;
          this._next = null;
          this._nextAdded = null;
          this._nextRemoved = null;
          this._prevRemoved = null;
          this._nextChanged = null;
        }
        return ($traceurRuntime.createClass)(KVChangeRecord, {toString: function() {
            return looseIdentical(this.previousValue, this.currentValue) ? stringify(this.key) : (stringify(this.key) + '[' + stringify(this.previousValue) + '->' + stringify(this.currentValue) + ']');
          }}, {});
      }());
      $__export("KVChangeRecord", KVChangeRecord);
    }
  };
});

System.register("angular2/src/change_detection/pipes/promise_pipe", ["angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/promise_pipe";
  var PromiseWrapper,
      isBlank,
      isPresent,
      Pipe,
      WrappedValue,
      PromisePipe,
      PromisePipeFactory;
  return {
    setters: [function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      Pipe = $__m.Pipe;
      WrappedValue = $__m.WrappedValue;
    }],
    execute: function() {
      PromisePipe = (function($__super) {
        function PromisePipe(ref) {
          $traceurRuntime.superConstructor(PromisePipe).call(this);
          this._ref = ref;
          this._latestValue = null;
          this._latestReturnedValue = null;
        }
        return ($traceurRuntime.createClass)(PromisePipe, {
          supports: function(promise) {
            return PromiseWrapper.isPromise(promise);
          },
          onDestroy: function() {
            if (isPresent(this._sourcePromise)) {
              this._latestValue = null;
              this._latestReturnedValue = null;
              this._sourcePromise = null;
            }
          },
          transform: function(promise) {
            var $__0 = this;
            if (isBlank(this._sourcePromise)) {
              this._sourcePromise = promise;
              promise.then((function(val) {
                if ($__0._sourcePromise === promise) {
                  $__0._updateLatestValue(val);
                }
              }));
              return null;
            }
            if (promise !== this._sourcePromise) {
              this._sourcePromise = null;
              return this.transform(promise);
            }
            if (this._latestValue === this._latestReturnedValue) {
              return this._latestReturnedValue;
            } else {
              this._latestReturnedValue = this._latestValue;
              return WrappedValue.wrap(this._latestValue);
            }
          },
          _updateLatestValue: function(value) {
            this._latestValue = value;
            this._ref.requestCheck();
          }
        }, {}, $__super);
      }(Pipe));
      $__export("PromisePipe", PromisePipe);
      PromisePipeFactory = (function() {
        function PromisePipeFactory() {}
        return ($traceurRuntime.createClass)(PromisePipeFactory, {
          supports: function(promise) {
            return PromiseWrapper.isPromise(promise);
          },
          create: function(cdRef) {
            return new PromisePipe(cdRef);
          }
        }, {});
      }());
      $__export("PromisePipeFactory", PromisePipeFactory);
    }
  };
});

System.register("angular2/src/change_detection/pipes/uppercase_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/uppercase_pipe";
  var isString,
      StringWrapper,
      Pipe,
      UpperCasePipe,
      UpperCaseFactory;
  return {
    setters: [function($__m) {
      isString = $__m.isString;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      Pipe = $__m.Pipe;
    }],
    execute: function() {
      UpperCasePipe = (function($__super) {
        function UpperCasePipe() {
          $traceurRuntime.superConstructor(UpperCasePipe).call(this);
          this._latestValue = null;
        }
        return ($traceurRuntime.createClass)(UpperCasePipe, {
          supports: function(str) {
            return isString(str);
          },
          onDestroy: function() {
            this._latestValue = null;
          },
          transform: function(value) {
            if (this._latestValue !== value) {
              this._latestValue = value;
              return StringWrapper.toUpperCase(value);
            } else {
              return this._latestValue;
            }
          }
        }, {}, $__super);
      }(Pipe));
      $__export("UpperCasePipe", UpperCasePipe);
      UpperCaseFactory = (function() {
        function UpperCaseFactory() {}
        return ($traceurRuntime.createClass)(UpperCaseFactory, {
          supports: function(str) {
            return isString(str);
          },
          create: function() {
            return new UpperCasePipe();
          }
        }, {});
      }());
      $__export("UpperCaseFactory", UpperCaseFactory);
    }
  };
});

System.register("angular2/src/change_detection/pipes/lowercase_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/lowercase_pipe";
  var isString,
      StringWrapper,
      Pipe,
      LowerCasePipe,
      LowerCaseFactory;
  return {
    setters: [function($__m) {
      isString = $__m.isString;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      Pipe = $__m.Pipe;
    }],
    execute: function() {
      LowerCasePipe = (function($__super) {
        function LowerCasePipe() {
          $traceurRuntime.superConstructor(LowerCasePipe).call(this);
          this._latestValue = null;
        }
        return ($traceurRuntime.createClass)(LowerCasePipe, {
          supports: function(str) {
            return isString(str);
          },
          onDestroy: function() {
            this._latestValue = null;
          },
          transform: function(value) {
            if (this._latestValue !== value) {
              this._latestValue = value;
              return StringWrapper.toLowerCase(value);
            } else {
              return this._latestValue;
            }
          }
        }, {}, $__super);
      }(Pipe));
      $__export("LowerCasePipe", LowerCasePipe);
      LowerCaseFactory = (function() {
        function LowerCaseFactory() {}
        return ($traceurRuntime.createClass)(LowerCaseFactory, {
          supports: function(str) {
            return isString(str);
          },
          create: function() {
            return new LowerCasePipe();
          }
        }, {});
      }());
      $__export("LowerCaseFactory", LowerCaseFactory);
    }
  };
});

System.register("angular2/src/change_detection/pipes/json_pipe", ["angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/json_pipe";
  var __decorate,
      __metadata,
      isPresent,
      CONST,
      Json,
      Pipe,
      PipeFactory,
      JsonPipe,
      JsonPipeFactory;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      CONST = $__m.CONST;
      Json = $__m.Json;
    }, function($__m) {
      Pipe = $__m.Pipe;
      PipeFactory = $__m.PipeFactory;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      JsonPipe = (function($__super) {
        function JsonPipe() {
          $traceurRuntime.superConstructor(JsonPipe).call(this);
          this._latestRef = null;
          this._latestValue = null;
        }
        return ($traceurRuntime.createClass)(JsonPipe, {
          onDestroy: function() {
            if (isPresent(this._latestValue)) {
              this._latestRef = null;
              this._latestValue = null;
            }
          },
          supports: function(obj) {
            return true;
          },
          transform: function(value) {
            if (value === this._latestRef) {
              return this._latestValue;
            } else {
              return this._prettyPrint(value);
            }
          },
          _prettyPrint: function(value) {
            this._latestRef = value;
            this._latestValue = Json.stringify(value);
            return this._latestValue;
          }
        }, {}, $__super);
      }(Pipe));
      $__export("JsonPipe", JsonPipe);
      JsonPipeFactory = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this);
        }
        return ($traceurRuntime.createClass)($__0, {
          supports: function(obj) {
            return true;
          },
          create: function(cdRef) {
            return new JsonPipe();
          }
        }, {}, $__super);
      }(PipeFactory));
      $__export("JsonPipeFactory", JsonPipeFactory);
      $__export("JsonPipeFactory", JsonPipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], JsonPipeFactory));
    }
  };
});

System.register("angular2/src/core/annotations_impl/visibility", ["angular2/src/facade/lang", "angular2/src/di/annotations_impl"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/visibility";
  var __decorate,
      __metadata,
      CONST,
      DependencyAnnotation,
      Visibility,
      Self,
      self,
      Parent,
      Ancestor,
      Unbounded;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }, function($__m) {
      DependencyAnnotation = $__m.DependencyAnnotation;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Visibility = (function($__super) {
        function $__0(depth, crossComponentBoundaries) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.depth = depth;
          this.crossComponentBoundaries = crossComponentBoundaries;
        }
        return ($traceurRuntime.createClass)($__0, {shouldIncludeSelf: function() {
            return this.depth === 0;
          }}, {}, $__super);
      }(DependencyAnnotation));
      $__export("Visibility", Visibility);
      $__export("Visibility", Visibility = __decorate([CONST(), __metadata('design:paramtypes', [Number, Boolean])], Visibility));
      Self = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, 0, false);
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Visibility));
      $__export("Self", Self);
      $__export("Self", Self = __decorate([CONST(), __metadata('design:paramtypes', [])], Self));
      self = new Self();
      $__export("self", self);
      Parent = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, 1, false);
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Visibility));
      $__export("Parent", Parent);
      $__export("Parent", Parent = __decorate([CONST(), __metadata('design:paramtypes', [])], Parent));
      Ancestor = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, 999999, false);
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Visibility));
      $__export("Ancestor", Ancestor);
      $__export("Ancestor", Ancestor = __decorate([CONST(), __metadata('design:paramtypes', [])], Ancestor));
      Unbounded = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).call(this, 999999, true);
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Visibility));
      $__export("Unbounded", Unbounded);
      $__export("Unbounded", Unbounded = __decorate([CONST(), __metadata('design:paramtypes', [])], Unbounded));
    }
  };
});

System.register("angular2/src/core/annotations_impl/view", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/view";
  var __decorate,
      __metadata,
      CONST,
      View;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      View = (($traceurRuntime.createClass)(function() {
        var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
            templateUrl = $__2.templateUrl,
            template = $__2.template,
            directives = $__2.directives,
            renderer = $__2.renderer;
        this.templateUrl = templateUrl;
        this.template = template;
        this.directives = directives;
        this.renderer = renderer;
      }, {}, {}));
      $__export("View", View);
      $__export("View", View = __decorate([CONST(), __metadata('design:paramtypes', [Object])], View));
    }
  };
});

System.register("angular2/src/di/forward_ref", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/forward_ref";
  function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    return forwardRefFn;
  }
  function resolveForwardRef(type) {
    if (typeof type == 'function' && type.hasOwnProperty('__forward_ref__') && type.__forward_ref__ === forwardRef) {
      return type();
    } else {
      return type;
    }
  }
  $__export("forwardRef", forwardRef);
  $__export("resolveForwardRef", resolveForwardRef);
  return {
    setters: [],
    execute: function() {
    }
  };
});

System.register("angular2/src/di/type_literal", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/type_literal";
  var TypeLiteral;
  return {
    setters: [],
    execute: function() {
      TypeLiteral = (function() {
        function TypeLiteral() {}
        return ($traceurRuntime.createClass)(TypeLiteral, {get type() {
            throw new Error("Type literals are only supported in Dart");
          }}, {});
      }());
      $__export("TypeLiteral", TypeLiteral);
    }
  };
});

System.register("angular2/src/di/exceptions", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/exceptions";
  var ListWrapper,
      stringify,
      BaseException,
      AbstractBindingError,
      NoBindingError,
      AsyncBindingError,
      CyclicDependencyError,
      InstantiationError,
      InvalidBindingError,
      NoAnnotationError;
  function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
      if (ListWrapper.contains(res, keys[i])) {
        ListWrapper.push(res, keys[i]);
        return res;
      } else {
        ListWrapper.push(res, keys[i]);
      }
    }
    return res;
  }
  function constructResolvingPath(keys) {
    if (keys.length > 1) {
      var reversed = findFirstClosedCycle(ListWrapper.reversed(keys));
      var tokenStrs = ListWrapper.map(reversed, (function(k) {
        return stringify(k.token);
      }));
      return " (" + tokenStrs.join(' -> ') + ")";
    } else {
      return "";
    }
  }
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      AbstractBindingError = (function($__super) {
        function AbstractBindingError(key, constructResolvingMessage) {
          $traceurRuntime.superConstructor(AbstractBindingError).call(this);
          this.keys = [key];
          this.constructResolvingMessage = constructResolvingMessage;
          this.message = this.constructResolvingMessage(this.keys);
        }
        return ($traceurRuntime.createClass)(AbstractBindingError, {
          addKey: function(key) {
            ListWrapper.push(this.keys, key);
            this.message = this.constructResolvingMessage(this.keys);
          },
          toString: function() {
            return this.message;
          }
        }, {}, $__super);
      }(BaseException));
      $__export("AbstractBindingError", AbstractBindingError);
      NoBindingError = (function($__super) {
        function NoBindingError(key) {
          $traceurRuntime.superConstructor(NoBindingError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("No provider for " + first + "!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(NoBindingError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("NoBindingError", NoBindingError);
      AsyncBindingError = (function($__super) {
        function AsyncBindingError(key) {
          $traceurRuntime.superConstructor(AsyncBindingError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("Cannot instantiate " + first + " synchronously. It is provided as a promise!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(AsyncBindingError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("AsyncBindingError", AsyncBindingError);
      CyclicDependencyError = (function($__super) {
        function CyclicDependencyError(key) {
          $traceurRuntime.superConstructor(CyclicDependencyError).call(this, key, function(keys) {
            return ("Cannot instantiate cyclic dependency!" + constructResolvingPath(keys));
          });
        }
        return ($traceurRuntime.createClass)(CyclicDependencyError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("CyclicDependencyError", CyclicDependencyError);
      InstantiationError = (function($__super) {
        function InstantiationError(cause, key) {
          $traceurRuntime.superConstructor(InstantiationError).call(this, key, function(keys) {
            var first = stringify(ListWrapper.first(keys).token);
            return ("Error during instantiation of " + first + "!" + constructResolvingPath(keys) + ". ORIGINAL ERROR: " + cause);
          });
          this.cause = cause;
          this.causeKey = key;
        }
        return ($traceurRuntime.createClass)(InstantiationError, {}, {}, $__super);
      }(AbstractBindingError));
      $__export("InstantiationError", InstantiationError);
      InvalidBindingError = (function($__super) {
        function InvalidBindingError(binding) {
          $traceurRuntime.superConstructor(InvalidBindingError).call(this);
          this.message = "Invalid binding - only instances of Binding and Type are allowed, got: " + binding.toString();
        }
        return ($traceurRuntime.createClass)(InvalidBindingError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("InvalidBindingError", InvalidBindingError);
      NoAnnotationError = (function($__super) {
        function NoAnnotationError(typeOrFunc) {
          $traceurRuntime.superConstructor(NoAnnotationError).call(this);
          this.message = "Cannot resolve all parameters for " + stringify(typeOrFunc) + ". " + 'Make sure they all have valid type or annotations.';
        }
        return ($traceurRuntime.createClass)(NoAnnotationError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("NoAnnotationError", NoAnnotationError);
    }
  };
});

System.register("angular2/src/di/opaque_token", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/opaque_token";
  var OpaqueToken;
  return {
    setters: [],
    execute: function() {
      OpaqueToken = (function() {
        function OpaqueToken(desc) {
          this._desc = ("Token(" + desc + ")");
        }
        return ($traceurRuntime.createClass)(OpaqueToken, {toString: function() {
            return this._desc;
          }}, {});
      }());
      $__export("OpaqueToken", OpaqueToken);
    }
  };
});

System.register("angular2/src/dom/dom_adapter", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/dom_adapter";
  var BaseException,
      isBlank,
      DOM,
      DomAdapter;
  function setRootDomAdapter(adapter) {
    if (isBlank(DOM)) {
      $__export("DOM", DOM = adapter);
    }
  }
  function _abstract() {
    return new BaseException('This method is abstract');
  }
  $__export("setRootDomAdapter", setRootDomAdapter);
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      $__export("DOM", DOM);
      DomAdapter = (function() {
        function DomAdapter() {}
        return ($traceurRuntime.createClass)(DomAdapter, {
          logError: function(error) {
            throw _abstract();
          },
          get attrToPropMap() {
            throw _abstract();
          },
          parse: function(templateHtml) {
            throw _abstract();
          },
          query: function(selector) {
            throw _abstract();
          },
          querySelector: function(el, selector) {
            throw _abstract();
          },
          querySelectorAll: function(el, selector) {
            throw _abstract();
          },
          on: function(el, evt, listener) {
            throw _abstract();
          },
          onAndCancel: function(el, evt, listener) {
            throw _abstract();
          },
          dispatchEvent: function(el, evt) {
            throw _abstract();
          },
          createMouseEvent: function(eventType) {
            throw _abstract();
          },
          createEvent: function(eventType) {
            throw _abstract();
          },
          getInnerHTML: function(el) {
            throw _abstract();
          },
          getOuterHTML: function(el) {
            throw _abstract();
          },
          nodeName: function(node) {
            throw _abstract();
          },
          nodeValue: function(node) {
            throw _abstract();
          },
          type: function(node) {
            throw _abstract();
          },
          content: function(node) {
            throw _abstract();
          },
          firstChild: function(el) {
            throw _abstract();
          },
          nextSibling: function(el) {
            throw _abstract();
          },
          parentElement: function(el) {
            throw _abstract();
          },
          childNodes: function(el) {
            throw _abstract();
          },
          childNodesAsList: function(el) {
            throw _abstract();
          },
          clearNodes: function(el) {
            throw _abstract();
          },
          appendChild: function(el, node) {
            throw _abstract();
          },
          removeChild: function(el, node) {
            throw _abstract();
          },
          replaceChild: function(el, newNode, oldNode) {
            throw _abstract();
          },
          remove: function(el) {
            throw _abstract();
          },
          insertBefore: function(el, node) {
            throw _abstract();
          },
          insertAllBefore: function(el, nodes) {
            throw _abstract();
          },
          insertAfter: function(el, node) {
            throw _abstract();
          },
          setInnerHTML: function(el, value) {
            throw _abstract();
          },
          getText: function(el) {
            throw _abstract();
          },
          setText: function(el, value) {
            throw _abstract();
          },
          getValue: function(el) {
            throw _abstract();
          },
          setValue: function(el, value) {
            throw _abstract();
          },
          getChecked: function(el) {
            throw _abstract();
          },
          setChecked: function(el, value) {
            throw _abstract();
          },
          createTemplate: function(html) {
            throw _abstract();
          },
          createElement: function(tagName) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createTextNode: function(text) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createScriptTag: function(attrName, attrValue) {
            var doc = arguments[2] !== (void 0) ? arguments[2] : null;
            throw _abstract();
          },
          createStyleElement: function(css) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : null;
            throw _abstract();
          },
          createShadowRoot: function(el) {
            throw _abstract();
          },
          getShadowRoot: function(el) {
            throw _abstract();
          },
          getHost: function(el) {
            throw _abstract();
          },
          getDistributedNodes: function(el) {
            throw _abstract();
          },
          clone: function(node) {
            throw _abstract();
          },
          hasProperty: function(element, name) {
            throw _abstract();
          },
          getElementsByClassName: function(element, name) {
            throw _abstract();
          },
          getElementsByTagName: function(element, name) {
            throw _abstract();
          },
          classList: function(element) {
            throw _abstract();
          },
          addClass: function(element, classname) {
            throw _abstract();
          },
          removeClass: function(element, classname) {
            throw _abstract();
          },
          hasClass: function(element, classname) {
            throw _abstract();
          },
          setStyle: function(element, stylename, stylevalue) {
            throw _abstract();
          },
          removeStyle: function(element, stylename) {
            throw _abstract();
          },
          getStyle: function(element, stylename) {
            throw _abstract();
          },
          tagName: function(element) {
            throw _abstract();
          },
          attributeMap: function(element) {
            throw _abstract();
          },
          hasAttribute: function(element, attribute) {
            throw _abstract();
          },
          getAttribute: function(element, attribute) {
            throw _abstract();
          },
          setAttribute: function(element, name, value) {
            throw _abstract();
          },
          removeAttribute: function(element, attribute) {
            throw _abstract();
          },
          templateAwareRoot: function(el) {
            throw _abstract();
          },
          createHtmlDocument: function() {
            throw _abstract();
          },
          defaultDoc: function() {
            throw _abstract();
          },
          getBoundingClientRect: function(el) {
            throw _abstract();
          },
          getTitle: function() {
            throw _abstract();
          },
          setTitle: function(newTitle) {
            throw _abstract();
          },
          elementMatches: function(n, selector) {
            throw _abstract();
          },
          isTemplateElement: function(el) {
            throw _abstract();
          },
          isTextNode: function(node) {
            throw _abstract();
          },
          isCommentNode: function(node) {
            throw _abstract();
          },
          isElementNode: function(node) {
            throw _abstract();
          },
          hasShadowRoot: function(node) {
            throw _abstract();
          },
          isShadowRoot: function(node) {
            throw _abstract();
          },
          importIntoDoc: function(node) {
            throw _abstract();
          },
          isPageRule: function(rule) {
            throw _abstract();
          },
          isStyleRule: function(rule) {
            throw _abstract();
          },
          isMediaRule: function(rule) {
            throw _abstract();
          },
          isKeyframesRule: function(rule) {
            throw _abstract();
          },
          getHref: function(element) {
            throw _abstract();
          },
          getEventKey: function(event) {
            throw _abstract();
          },
          resolveAndSetHref: function(element, baseUrl, href) {
            throw _abstract();
          },
          cssToRules: function(css) {
            throw _abstract();
          },
          supportsDOMEvents: function() {
            throw _abstract();
          },
          supportsNativeShadowDOM: function() {
            throw _abstract();
          },
          getGlobalEventTarget: function(target) {
            throw _abstract();
          },
          getHistory: function() {
            throw _abstract();
          },
          getLocation: function() {
            throw _abstract();
          },
          getBaseHref: function() {
            throw _abstract();
          }
        }, {});
      }());
      $__export("DomAdapter", DomAdapter);
    }
  };
});

System.register("angular2/src/dom/generic_browser_adapter", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/generic_browser_adapter";
  var ListWrapper,
      isPresent,
      isFunction,
      DomAdapter,
      GenericBrowserDomAdapter;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isFunction = $__m.isFunction;
    }, function($__m) {
      DomAdapter = $__m.DomAdapter;
    }],
    execute: function() {
      GenericBrowserDomAdapter = (function($__super) {
        function GenericBrowserDomAdapter() {
          $traceurRuntime.superConstructor(GenericBrowserDomAdapter).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(GenericBrowserDomAdapter, {
          getDistributedNodes: function(el) {
            return el.getDistributedNodes();
          },
          resolveAndSetHref: function(el, baseUrl, href) {
            el.href = href == null ? baseUrl : baseUrl + '/../' + href;
          },
          cssToRules: function(css) {
            var style = this.createStyleElement(css);
            this.appendChild(this.defaultDoc().head, style);
            var rules = ListWrapper.create();
            if (isPresent(style.sheet)) {
              try {
                var rawRules = style.sheet.cssRules;
                rules = ListWrapper.createFixedSize(rawRules.length);
                for (var i = 0; i < rawRules.length; i++) {
                  rules[i] = rawRules[i];
                }
              } catch (e) {}
            } else {}
            this.remove(style);
            return rules;
          },
          supportsDOMEvents: function() {
            return true;
          },
          supportsNativeShadowDOM: function() {
            return isFunction(this.defaultDoc().body.createShadowRoot);
          }
        }, {}, $__super);
      }(DomAdapter));
      $__export("GenericBrowserDomAdapter", GenericBrowserDomAdapter);
    }
  };
});

System.register("angular2/src/core/annotations_impl/annotations", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/di/annotations_impl", "angular2/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/annotations";
  var __decorate,
      __metadata,
      CONST,
      isPresent,
      CONST_EXPR,
      ListWrapper,
      Injectable,
      DEFAULT,
      Directive,
      Component,
      LifecycleEvent,
      onDestroy,
      onChange,
      onAllChangesDone;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
      isPresent = $__m.isPresent;
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      DEFAULT = $__m.DEFAULT;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Directive = (function($__super) {
        function $__0() {
          var $__3;
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__2.selector,
              properties = $__2.properties,
              events = $__2.events,
              hostListeners = $__2.hostListeners,
              hostProperties = $__2.hostProperties,
              hostAttributes = $__2.hostAttributes,
              hostActions = $__2.hostActions,
              lifecycle = $__2.lifecycle,
              hostInjector = $__2.hostInjector,
              compileChildren = ($__3 = $__2.compileChildren) === void 0 ? true : $__3;
          $traceurRuntime.superConstructor($__0).call(this);
          this.selector = selector;
          this.properties = properties;
          this.events = events;
          this.hostListeners = hostListeners;
          this.hostProperties = hostProperties;
          this.hostAttributes = hostAttributes;
          this.hostActions = hostActions;
          this.lifecycle = lifecycle;
          this.compileChildren = compileChildren;
          this.hostInjector = hostInjector;
        }
        return ($traceurRuntime.createClass)($__0, {hasLifecycleHook: function(hook) {
            return isPresent(this.lifecycle) ? ListWrapper.contains(this.lifecycle, hook) : false;
          }}, {}, $__super);
      }(Injectable));
      $__export("Directive", Directive);
      $__export("Directive", Directive = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Directive));
      Component = (function($__super) {
        function $__0() {
          var $__3,
              $__4;
          var $__2 = arguments[0] !== (void 0) ? arguments[0] : {},
              selector = $__2.selector,
              properties = $__2.properties,
              events = $__2.events,
              hostListeners = $__2.hostListeners,
              hostProperties = $__2.hostProperties,
              hostAttributes = $__2.hostAttributes,
              hostActions = $__2.hostActions,
              appInjector = $__2.appInjector,
              lifecycle = $__2.lifecycle,
              hostInjector = $__2.hostInjector,
              viewInjector = $__2.viewInjector,
              changeDetection = ($__3 = $__2.changeDetection) === void 0 ? DEFAULT : $__3,
              compileChildren = ($__4 = $__2.compileChildren) === void 0 ? true : $__4;
          $traceurRuntime.superConstructor($__0).call(this, {
            selector: selector,
            properties: properties,
            events: events,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            hostActions: hostActions,
            hostInjector: hostInjector,
            lifecycle: lifecycle,
            compileChildren: compileChildren
          });
          this.changeDetection = changeDetection;
          this.appInjector = appInjector;
          this.viewInjector = viewInjector;
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(Directive));
      $__export("Component", Component);
      $__export("Component", Component = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Component));
      LifecycleEvent = (($traceurRuntime.createClass)(function(name) {
        this.name = name;
      }, {}, {}));
      $__export("LifecycleEvent", LifecycleEvent);
      $__export("LifecycleEvent", LifecycleEvent = __decorate([CONST(), __metadata('design:paramtypes', [String])], LifecycleEvent));
      onDestroy = CONST_EXPR(new LifecycleEvent("onDestroy"));
      $__export("onDestroy", onDestroy);
      onChange = CONST_EXPR(new LifecycleEvent("onChange"));
      $__export("onChange", onChange);
      onAllChangesDone = CONST_EXPR(new LifecycleEvent("onAllChangesDone"));
      $__export("onAllChangesDone", onAllChangesDone);
    }
  };
});

System.register("angular2/src/core/compiler/view_ref", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_ref";
  var isPresent,
      ViewRef,
      ProtoViewRef;
  function internalView(viewRef) {
    return viewRef._view;
  }
  function internalProtoView(protoViewRef) {
    return isPresent(protoViewRef) ? protoViewRef._protoView : null;
  }
  $__export("internalView", internalView);
  $__export("internalProtoView", internalProtoView);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      ViewRef = (function() {
        function ViewRef(view) {
          this._view = view;
        }
        return ($traceurRuntime.createClass)(ViewRef, {
          get render() {
            return this._view.render;
          },
          setLocal: function(contextName, value) {
            this._view.setLocal(contextName, value);
          }
        }, {});
      }());
      $__export("ViewRef", ViewRef);
      ProtoViewRef = (function() {
        function ProtoViewRef(protoView) {
          this._protoView = protoView;
        }
        return ($traceurRuntime.createClass)(ProtoViewRef, {}, {});
      }());
      $__export("ProtoViewRef", ProtoViewRef);
    }
  };
});

System.register("angular2/src/core/annotations_impl/di", ["angular2/src/facade/lang", "angular2/src/di/annotations_impl"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations_impl/di";
  var __decorate,
      __metadata,
      CONST,
      DependencyAnnotation,
      Attribute,
      Query;
  return {
    setters: [function($__m) {
      CONST = $__m.CONST;
    }, function($__m) {
      DependencyAnnotation = $__m.DependencyAnnotation;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Attribute = (function($__super) {
        function $__0(attributeName) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.attributeName = attributeName;
        }
        return ($traceurRuntime.createClass)($__0, {get token() {
            return this;
          }}, {}, $__super);
      }(DependencyAnnotation));
      $__export("Attribute", Attribute);
      $__export("Attribute", Attribute = __decorate([CONST(), __metadata('design:paramtypes', [String])], Attribute));
      Query = (function($__super) {
        function $__0(directive) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.directive = directive;
        }
        return ($traceurRuntime.createClass)($__0, {}, {}, $__super);
      }(DependencyAnnotation));
      $__export("Query", Query);
      $__export("Query", Query = __decorate([CONST(), __metadata('design:paramtypes', [Object])], Query));
    }
  };
});

System.register("angular2/src/render/api", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/api";
  var isPresent,
      EventBinding,
      ElementBinder,
      DirectiveBinder,
      ProtoViewDto,
      DirectiveMetadata,
      RenderProtoViewRef,
      RenderViewRef,
      ViewDefinition,
      RenderCompiler,
      Renderer;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      EventBinding = (function() {
        function EventBinding(fullName, source) {
          this.fullName = fullName;
          this.source = source;
        }
        return ($traceurRuntime.createClass)(EventBinding, {}, {});
      }());
      $__export("EventBinding", EventBinding);
      ElementBinder = (function() {
        function ElementBinder() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              index = $__1.index,
              parentIndex = $__1.parentIndex,
              distanceToParent = $__1.distanceToParent,
              directives = $__1.directives,
              nestedProtoView = $__1.nestedProtoView,
              propertyBindings = $__1.propertyBindings,
              variableBindings = $__1.variableBindings,
              eventBindings = $__1.eventBindings,
              textBindings = $__1.textBindings,
              readAttributes = $__1.readAttributes;
          this.index = index;
          this.parentIndex = parentIndex;
          this.distanceToParent = distanceToParent;
          this.directives = directives;
          this.nestedProtoView = nestedProtoView;
          this.propertyBindings = propertyBindings;
          this.variableBindings = variableBindings;
          this.eventBindings = eventBindings;
          this.textBindings = textBindings;
          this.readAttributes = readAttributes;
        }
        return ($traceurRuntime.createClass)(ElementBinder, {}, {});
      }());
      $__export("ElementBinder", ElementBinder);
      DirectiveBinder = (function() {
        function DirectiveBinder($__1) {
          var $__2 = $__1,
              directiveIndex = $__2.directiveIndex,
              propertyBindings = $__2.propertyBindings,
              eventBindings = $__2.eventBindings,
              hostPropertyBindings = $__2.hostPropertyBindings;
          this.directiveIndex = directiveIndex;
          this.propertyBindings = propertyBindings;
          this.eventBindings = eventBindings;
          this.hostPropertyBindings = hostPropertyBindings;
        }
        return ($traceurRuntime.createClass)(DirectiveBinder, {}, {});
      }());
      $__export("DirectiveBinder", DirectiveBinder);
      ProtoViewDto = (function() {
        function ProtoViewDto($__1) {
          var $__2 = $__1,
              render = $__2.render,
              elementBinders = $__2.elementBinders,
              variableBindings = $__2.variableBindings,
              type = $__2.type;
          this.render = render;
          this.elementBinders = elementBinders;
          this.variableBindings = variableBindings;
          this.type = type;
        }
        return ($traceurRuntime.createClass)(ProtoViewDto, {}, {
          get HOST_VIEW_TYPE() {
            return 0;
          },
          get COMPONENT_VIEW_TYPE() {
            return 1;
          },
          get EMBEDDED_VIEW_TYPE() {
            return 2;
          }
        });
      }());
      $__export("ProtoViewDto", ProtoViewDto);
      DirectiveMetadata = (function() {
        function DirectiveMetadata($__1) {
          var $__2 = $__1,
              id = $__2.id,
              selector = $__2.selector,
              compileChildren = $__2.compileChildren,
              events = $__2.events,
              hostListeners = $__2.hostListeners,
              hostProperties = $__2.hostProperties,
              hostAttributes = $__2.hostAttributes,
              hostActions = $__2.hostActions,
              properties = $__2.properties,
              readAttributes = $__2.readAttributes,
              type = $__2.type,
              callOnDestroy = $__2.callOnDestroy,
              callOnChange = $__2.callOnChange,
              callOnAllChangesDone = $__2.callOnAllChangesDone,
              changeDetection = $__2.changeDetection;
          this.id = id;
          this.selector = selector;
          this.compileChildren = isPresent(compileChildren) ? compileChildren : true;
          this.events = events;
          this.hostListeners = hostListeners;
          this.hostProperties = hostProperties;
          this.hostAttributes = hostAttributes;
          this.hostActions = hostActions;
          this.properties = properties;
          this.readAttributes = readAttributes;
          this.type = type;
          this.callOnDestroy = callOnDestroy;
          this.callOnChange = callOnChange;
          this.callOnAllChangesDone = callOnAllChangesDone;
          this.changeDetection = changeDetection;
        }
        return ($traceurRuntime.createClass)(DirectiveMetadata, {}, {
          get DIRECTIVE_TYPE() {
            return 0;
          },
          get COMPONENT_TYPE() {
            return 1;
          }
        });
      }());
      $__export("DirectiveMetadata", DirectiveMetadata);
      RenderProtoViewRef = (function() {
        function RenderProtoViewRef() {}
        return ($traceurRuntime.createClass)(RenderProtoViewRef, {}, {});
      }());
      $__export("RenderProtoViewRef", RenderProtoViewRef);
      RenderViewRef = (function() {
        function RenderViewRef() {}
        return ($traceurRuntime.createClass)(RenderViewRef, {}, {});
      }());
      $__export("RenderViewRef", RenderViewRef);
      ViewDefinition = (function() {
        function ViewDefinition($__1) {
          var $__2 = $__1,
              componentId = $__2.componentId,
              absUrl = $__2.absUrl,
              template = $__2.template,
              directives = $__2.directives;
          this.componentId = componentId;
          this.absUrl = absUrl;
          this.template = template;
          this.directives = directives;
        }
        return ($traceurRuntime.createClass)(ViewDefinition, {}, {});
      }());
      $__export("ViewDefinition", ViewDefinition);
      RenderCompiler = (function() {
        function RenderCompiler() {}
        return ($traceurRuntime.createClass)(RenderCompiler, {
          compileHost: function(directiveMetadata) {
            return null;
          },
          compile: function(template) {
            return null;
          }
        }, {});
      }());
      $__export("RenderCompiler", RenderCompiler);
      Renderer = (function() {
        function Renderer() {}
        return ($traceurRuntime.createClass)(Renderer, {
          createRootHostView: function(hostProtoViewRef, hostElementSelector) {
            return null;
          },
          detachFreeHostView: function(parentHostViewRef, hostViewRef) {},
          createView: function(protoViewRef) {
            return null;
          },
          destroyView: function(viewRef) {},
          attachComponentView: function(hostViewRef, elementIndex, componentViewRef) {},
          detachComponentView: function(hostViewRef, boundElementIndex, componentViewRef) {},
          attachViewInContainer: function(parentViewRef, boundElementIndex, atIndex, viewRef) {},
          detachViewInContainer: function(parentViewRef, boundElementIndex, atIndex, viewRef) {},
          hydrateView: function(viewRef) {},
          dehydrateView: function(viewRef) {},
          setElementProperty: function(viewRef, elementIndex, propertyName, propertyValue) {},
          callAction: function(viewRef, elementIndex, actionExpression, actionArgs) {},
          setText: function(viewRef, textNodeIndex, text) {},
          setEventDispatcher: function(viewRef, dispatcher) {}
        }, {});
      }());
      $__export("Renderer", Renderer);
    }
  };
});

System.register("angular2/src/core/compiler/element_binder", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_binder";
  var isBlank,
      isPresent,
      BaseException,
      ElementBinder;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      ElementBinder = (function() {
        function ElementBinder(index, parent, distanceToParent, protoElementInjector, componentDirective) {
          this.index = index;
          this.parent = parent;
          this.distanceToParent = distanceToParent;
          this.protoElementInjector = protoElementInjector;
          this.componentDirective = componentDirective;
          if (isBlank(index)) {
            throw new BaseException('null index not allowed.');
          }
          this.hostListeners = null;
          this.nestedProtoView = null;
        }
        return ($traceurRuntime.createClass)(ElementBinder, {
          hasStaticComponent: function() {
            return isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
          },
          hasDynamicComponent: function() {
            return isPresent(this.componentDirective) && isBlank(this.nestedProtoView);
          },
          hasEmbeddedProtoView: function() {
            return !isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
          }
        }, {});
      }());
      $__export("ElementBinder", ElementBinder);
    }
  };
});

System.register("angular2/src/core/compiler/view_pool", ["angular2/di", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_pool";
  var __decorate,
      __metadata,
      __param,
      Inject,
      ListWrapper,
      MapWrapper,
      isPresent,
      isBlank,
      APP_VIEW_POOL_CAPACITY,
      AppViewPool;
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      APP_VIEW_POOL_CAPACITY = 'AppViewPool.viewPoolCapacity';
      $__export("APP_VIEW_POOL_CAPACITY", APP_VIEW_POOL_CAPACITY);
      AppViewPool = (function() {
        function AppViewPool(poolCapacityPerProtoView) {
          this._poolCapacityPerProtoView = poolCapacityPerProtoView;
          this._pooledViewsPerProtoView = MapWrapper.create();
        }
        return ($traceurRuntime.createClass)(AppViewPool, {
          getView: function(protoView) {
            var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
            if (isPresent(pooledViews) && pooledViews.length > 0) {
              return ListWrapper.removeLast(pooledViews);
            }
            return null;
          },
          returnView: function(view) {
            var protoView = view.proto;
            var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
            if (isBlank(pooledViews)) {
              pooledViews = [];
              MapWrapper.set(this._pooledViewsPerProtoView, protoView, pooledViews);
            }
            if (pooledViews.length < this._poolCapacityPerProtoView) {
              ListWrapper.push(pooledViews, view);
            }
          }
        }, {});
      }());
      $__export("AppViewPool", AppViewPool);
      $__export("AppViewPool", AppViewPool = __decorate([__param(0, Inject(APP_VIEW_POOL_CAPACITY)), __metadata('design:paramtypes', [Object])], AppViewPool));
    }
  };
});

System.register("angular2/src/core/compiler/view_container_ref", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/compiler/view_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_container_ref";
  var ListWrapper,
      isPresent,
      ViewRef,
      internalView,
      ViewContainerRef;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ViewRef = $__m.ViewRef;
      internalView = $__m.internalView;
    }],
    execute: function() {
      ViewContainerRef = (function() {
        function ViewContainerRef(viewManager, element) {
          this.viewManager = viewManager;
          this.element = element;
        }
        return ($traceurRuntime.createClass)(ViewContainerRef, {
          _getViews: function() {
            var vc = internalView(this.element.parentView).viewContainers[this.element.boundElementIndex];
            return isPresent(vc) ? vc.views : [];
          },
          clear: function() {
            for (var i = this.length - 1; i >= 0; i--) {
              this.remove(i);
            }
          },
          get: function(index) {
            return new ViewRef(this._getViews()[index]);
          },
          get length() {
            return this._getViews().length;
          },
          create: function() {
            var protoViewRef = arguments[0] !== (void 0) ? arguments[0] : null;
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            var context = arguments[2] !== (void 0) ? arguments[2] : null;
            var injector = arguments[3] !== (void 0) ? arguments[3] : null;
            if (atIndex == -1)
              atIndex = this.length;
            return this.viewManager.createViewInContainer(this.element, atIndex, protoViewRef, context, injector);
          },
          insert: function(viewRef) {
            var atIndex = arguments[1] !== (void 0) ? arguments[1] : -1;
            if (atIndex == -1)
              atIndex = this.length;
            return this.viewManager.attachViewInContainer(this.element, atIndex, viewRef);
          },
          indexOf: function(viewRef) {
            return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
          },
          remove: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this.length - 1;
            this.viewManager.destroyViewInContainer(this.element, atIndex);
          },
          detach: function() {
            var atIndex = arguments[0] !== (void 0) ? arguments[0] : -1;
            if (atIndex == -1)
              atIndex = this.length - 1;
            return this.viewManager.detachViewInContainer(this.element, atIndex);
          }
        }, {});
      }());
      $__export("ViewContainerRef", ViewContainerRef);
    }
  };
});

System.register("angular2/src/render/dom/view/view", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/change_detection", "angular2/src/facade/lang", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/view";
  var DOM,
      ListWrapper,
      MapWrapper,
      Locals,
      isPresent,
      RenderViewRef,
      DomViewRef,
      NG_BINDING_CLASS,
      DomView;
  function resolveInternalDomView(viewRef) {
    return viewRef._view;
  }
  $__export("resolveInternalDomView", resolveInternalDomView);
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      Locals = $__m.Locals;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      RenderViewRef = $__m.RenderViewRef;
    }],
    execute: function() {
      DomViewRef = (function($__super) {
        function DomViewRef(view) {
          $traceurRuntime.superConstructor(DomViewRef).call(this);
          this._view = view;
        }
        return ($traceurRuntime.createClass)(DomViewRef, {}, {}, $__super);
      }(RenderViewRef));
      $__export("DomViewRef", DomViewRef);
      NG_BINDING_CLASS = 'ng-binding';
      DomView = (function() {
        function DomView(proto, rootNodes, boundTextNodes, boundElements, contentTags) {
          this.proto = proto;
          this.rootNodes = rootNodes;
          this.boundTextNodes = boundTextNodes;
          this.boundElements = boundElements;
          this.contentTags = contentTags;
          this.viewContainers = ListWrapper.createFixedSize(boundElements.length);
          this.lightDoms = ListWrapper.createFixedSize(boundElements.length);
          this.hostLightDom = null;
          this.hydrated = false;
          this.eventHandlerRemovers = [];
          this.eventDispatcher = null;
          this.shadowRoot = null;
        }
        return ($traceurRuntime.createClass)(DomView, {
          getDirectParentLightDom: function(boundElementIndex) {
            var binder = this.proto.elementBinders[boundElementIndex];
            var destLightDom = null;
            if (binder.parentIndex !== -1 && binder.distanceToParent === 1) {
              destLightDom = this.lightDoms[binder.parentIndex];
            }
            return destLightDom;
          },
          setElementProperty: function(elementIndex, propertyName, value) {
            var setter = MapWrapper.get(this.proto.elementBinders[elementIndex].propertySetters, propertyName);
            setter(this.boundElements[elementIndex], value);
          },
          callAction: function(elementIndex, actionExpression, actionArgs) {
            var binder = this.proto.elementBinders[elementIndex];
            var hostAction = MapWrapper.get(binder.hostActions, actionExpression);
            hostAction.eval(this.boundElements[elementIndex], this._localsWithAction(actionArgs));
          },
          _localsWithAction: function(action) {
            var map = MapWrapper.create();
            MapWrapper.set(map, '$action', action);
            return new Locals(null, map);
          },
          setText: function(textIndex, value) {
            DOM.setText(this.boundTextNodes[textIndex], value);
          },
          dispatchEvent: function(elementIndex, eventName, event) {
            var allowDefaultBehavior = true;
            if (isPresent(this.eventDispatcher)) {
              var evalLocals = MapWrapper.create();
              MapWrapper.set(evalLocals, '$event', event);
              allowDefaultBehavior = this.eventDispatcher.dispatchEvent(elementIndex, eventName, evalLocals);
              if (!allowDefaultBehavior) {
                event.preventDefault();
              }
            }
            return allowDefaultBehavior;
          }
        }, {});
      }());
      $__export("DomView", DomView);
    }
  };
});

System.register("angular2/src/core/compiler/base_query_list", ["angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/base_query_list";
  var ListWrapper,
      BaseQueryList;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      BaseQueryList = (function() {
        var $__1;
        function BaseQueryList() {
          this._results = [];
          this._callbacks = [];
          this._dirty = false;
        }
        return ($traceurRuntime.createClass)(BaseQueryList, ($__1 = {}, Object.defineProperty($__1, Symbol.iterator, {
          value: function() {
            return this._results[Symbol.iterator]();
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "reset", {
          value: function(newList) {
            this._results = newList;
            this._dirty = true;
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "add", {
          value: function(obj) {
            ListWrapper.push(this._results, obj);
            this._dirty = true;
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "fireCallbacks", {
          value: function() {
            if (this._dirty) {
              ListWrapper.forEach(this._callbacks, (function(c) {
                return c();
              }));
              this._dirty = false;
            }
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "onChange", {
          value: function(callback) {
            ListWrapper.push(this._callbacks, callback);
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), Object.defineProperty($__1, "removeCallback", {
          value: function(callback) {
            ListWrapper.remove(this._callbacks, callback);
          },
          configurable: true,
          enumerable: true,
          writable: true
        }), $__1), {});
      }());
      $__export("BaseQueryList", BaseQueryList);
    }
  };
});

System.register("angular2/src/core/compiler/template_resolver", ["angular2/di", "angular2/src/core/annotations_impl/view", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/reflection/reflection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/template_resolver";
  var __decorate,
      __metadata,
      Injectable,
      View,
      isBlank,
      MapWrapper,
      reflector,
      TemplateResolver;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      View = $__m.View;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      reflector = $__m.reflector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      TemplateResolver = (($traceurRuntime.createClass)(function() {
        this._cache = MapWrapper.create();
      }, {
        resolve: function(component) {
          var view = MapWrapper.get(this._cache, component);
          if (isBlank(view)) {
            view = this._resolve(component);
            MapWrapper.set(this._cache, component, view);
          }
          return view;
        },
        _resolve: function(component) {
          var annotations = reflector.annotations(component);
          for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof View) {
              return annotation;
            }
          }
          return null;
        }
      }, {}));
      $__export("TemplateResolver", TemplateResolver);
      $__export("TemplateResolver", TemplateResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], TemplateResolver));
    }
  };
});

System.register("angular2/src/core/compiler/component_url_mapper", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/component_url_mapper";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      MapWrapper,
      ComponentUrlMapper,
      RuntimeComponentUrlMapper;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ComponentUrlMapper = (($traceurRuntime.createClass)(function() {}, {getUrl: function(component) {
          return './';
        }}, {}));
      $__export("ComponentUrlMapper", ComponentUrlMapper);
      $__export("ComponentUrlMapper", ComponentUrlMapper = __decorate([Injectable(), __metadata('design:paramtypes', [])], ComponentUrlMapper));
      RuntimeComponentUrlMapper = (function($__super) {
        function RuntimeComponentUrlMapper() {
          $traceurRuntime.superConstructor(RuntimeComponentUrlMapper).call(this);
          this._componentUrls = MapWrapper.create();
        }
        return ($traceurRuntime.createClass)(RuntimeComponentUrlMapper, {
          setComponentUrl: function(component, url) {
            MapWrapper.set(this._componentUrls, component, url);
          },
          getUrl: function(component) {
            var url = MapWrapper.get(this._componentUrls, component);
            if (isPresent(url))
              return url;
            return $traceurRuntime.superGet(this, RuntimeComponentUrlMapper.prototype, "getUrl").call(this, component);
          }
        }, {}, $__super);
      }(ComponentUrlMapper));
      $__export("RuntimeComponentUrlMapper", RuntimeComponentUrlMapper);
    }
  };
});

System.register("angular2/src/core/compiler/proto_view_factory", ["angular2/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/reflection/reflection", "angular2/change_detection", "angular2/src/render/api", "angular2/src/core/compiler/view", "angular2/src/core/compiler/element_injector"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/proto_view_factory";
  var __decorate,
      __metadata,
      Injectable,
      ListWrapper,
      MapWrapper,
      isPresent,
      isBlank,
      reflector,
      ChangeDetection,
      DirectiveIndex,
      BindingRecord,
      DirectiveRecord,
      DEFAULT,
      ChangeDetectorDefinition,
      renderApi,
      AppProtoView,
      ProtoElementInjector,
      BindingRecordsCreator,
      ProtoViewFactory,
      RenderProtoViewWithIndex,
      ParentProtoElementInjectorWithDistance;
  function getChangeDetectorDefinitions(hostComponentMetadata, rootRenderProtoView, allRenderDirectiveMetadata) {
    var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
    var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
    var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex, nestedPvVariableBindings);
    return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
  }
  function _collectNestedProtoViews(renderProtoView) {
    var parentIndex = arguments[1] !== (void 0) ? arguments[1] : null;
    var boundElementIndex = arguments[2] !== (void 0) ? arguments[2] : null;
    var result = arguments[3] !== (void 0) ? arguments[3] : null;
    if (isBlank(result)) {
      result = [];
    }
    ListWrapper.push(result, new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex, boundElementIndex));
    var currentIndex = result.length - 1;
    var childBoundElementIndex = 0;
    ListWrapper.forEach(renderProtoView.elementBinders, (function(elementBinder) {
      if (isPresent(elementBinder.nestedProtoView)) {
        _collectNestedProtoViews(elementBinder.nestedProtoView, currentIndex, childBoundElementIndex, result);
      }
      childBoundElementIndex++;
    }));
    return result;
  }
  function _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata) {
    return ListWrapper.map(nestedPvsWithIndex, (function(pvWithIndex) {
      var elementBinders = pvWithIndex.renderProtoView.elementBinders;
      var bindingRecordsCreator = new BindingRecordsCreator();
      var bindingRecords = bindingRecordsCreator.getBindingRecords(elementBinders, allRenderDirectiveMetadata);
      var directiveRecords = bindingRecordsCreator.getDirectiveRecords(elementBinders, allRenderDirectiveMetadata);
      var strategyName = DEFAULT;
      var typeString;
      if (pvWithIndex.renderProtoView.type === renderApi.ProtoViewDto.COMPONENT_VIEW_TYPE) {
        strategyName = hostComponentMetadata.changeDetection;
        typeString = 'comp';
      } else if (pvWithIndex.renderProtoView.type === renderApi.ProtoViewDto.HOST_VIEW_TYPE) {
        typeString = 'host';
      } else {
        typeString = 'embedded';
      }
      var id = (hostComponentMetadata.id + "_" + typeString + "_" + pvWithIndex.index);
      var variableNames = nestedPvVariableNames[pvWithIndex.index];
      return new ChangeDetectorDefinition(id, strategyName, variableNames, bindingRecords, directiveRecords);
    }));
  }
  function _createAppProtoView(renderProtoView, protoChangeDetector, variableBindings, allDirectives) {
    var elementBinders = renderProtoView.elementBinders;
    var protoView = new AppProtoView(renderProtoView.render, protoChangeDetector, variableBindings);
    _createElementBinders(protoView, elementBinders, allDirectives);
    _bindDirectiveEvents(protoView, elementBinders);
    return protoView;
  }
  function _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex) {
    return ListWrapper.map(nestedPvsWithIndex, (function(pvWithIndex) {
      return _createVariableBindings(pvWithIndex.renderProtoView);
    }));
  }
  function _createVariableBindings(renderProtoView) {
    var variableBindings = MapWrapper.create();
    MapWrapper.forEach(renderProtoView.variableBindings, (function(mappedName, varName) {
      MapWrapper.set(variableBindings, varName, mappedName);
    }));
    ListWrapper.forEach(renderProtoView.elementBinders, (function(binder) {
      MapWrapper.forEach(binder.variableBindings, (function(mappedName, varName) {
        MapWrapper.set(variableBindings, varName, mappedName);
      }));
    }));
    return variableBindings;
  }
  function _collectNestedProtoViewsVariableNames(nestedPvsWithIndex, nestedPvVariableBindings) {
    var nestedPvVariableNames = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
    ListWrapper.forEach(nestedPvsWithIndex, (function(pvWithIndex) {
      var parentVariableNames = isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
      nestedPvVariableNames[pvWithIndex.index] = _createVariableNames(parentVariableNames, nestedPvVariableBindings[pvWithIndex.index]);
    }));
    return nestedPvVariableNames;
  }
  function _createVariableNames(parentVariableNames, variableBindings) {
    var variableNames = isPresent(parentVariableNames) ? ListWrapper.clone(parentVariableNames) : [];
    MapWrapper.forEach(variableBindings, (function(local, v) {
      ListWrapper.push(variableNames, local);
    }));
    return variableNames;
  }
  function _createElementBinders(protoView, elementBinders, allDirectiveBindings) {
    for (var i = 0; i < elementBinders.length; i++) {
      var renderElementBinder = elementBinders[i];
      var dirs = elementBinders[i].directives;
      var parentPeiWithDistance = _findParentProtoElementInjectorWithDistance(i, protoView.elementBinders, elementBinders);
      var directiveBindings = ListWrapper.map(dirs, (function(dir) {
        return allDirectiveBindings[dir.directiveIndex];
      }));
      var componentDirectiveBinding = null;
      if (directiveBindings.length > 0) {
        if (directiveBindings[0].metadata.type === renderApi.DirectiveMetadata.COMPONENT_TYPE) {
          componentDirectiveBinding = directiveBindings[0];
        }
      }
      var protoElementInjector = _createProtoElementInjector(i, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings);
      _createElementBinder(protoView, i, renderElementBinder, protoElementInjector, componentDirectiveBinding);
    }
  }
  function _findParentProtoElementInjectorWithDistance(binderIndex, elementBinders, renderElementBinders) {
    var distance = 0;
    do {
      var renderElementBinder = renderElementBinders[binderIndex];
      binderIndex = renderElementBinder.parentIndex;
      if (binderIndex !== -1) {
        distance += renderElementBinder.distanceToParent;
        var elementBinder = elementBinders[binderIndex];
        if (isPresent(elementBinder.protoElementInjector)) {
          return new ParentProtoElementInjectorWithDistance(elementBinder.protoElementInjector, distance);
        }
      }
    } while (binderIndex !== -1);
    return new ParentProtoElementInjectorWithDistance(null, -1);
  }
  function _createProtoElementInjector(binderIndex, parentPeiWithDistance, renderElementBinder, componentDirectiveBinding, directiveBindings) {
    var protoElementInjector = null;
    var hasVariables = MapWrapper.size(renderElementBinder.variableBindings) > 0;
    if (directiveBindings.length > 0 || hasVariables) {
      protoElementInjector = ProtoElementInjector.create(parentPeiWithDistance.protoElementInjector, binderIndex, directiveBindings, isPresent(componentDirectiveBinding), parentPeiWithDistance.distance);
      protoElementInjector.attributes = renderElementBinder.readAttributes;
      if (hasVariables) {
        protoElementInjector.exportComponent = isPresent(componentDirectiveBinding);
        protoElementInjector.exportElement = isBlank(componentDirectiveBinding);
        var exportImplicitName = MapWrapper.get(renderElementBinder.variableBindings, '\$implicit');
        if (isPresent(exportImplicitName)) {
          protoElementInjector.exportImplicitName = exportImplicitName;
        }
      }
    }
    return protoElementInjector;
  }
  function _createElementBinder(protoView, boundElementIndex, renderElementBinder, protoElementInjector, componentDirectiveBinding) {
    var parent = null;
    if (renderElementBinder.parentIndex !== -1) {
      parent = protoView.elementBinders[renderElementBinder.parentIndex];
    }
    var elBinder = protoView.bindElement(parent, renderElementBinder.distanceToParent, protoElementInjector, componentDirectiveBinding);
    protoView.bindEvent(renderElementBinder.eventBindings, boundElementIndex, -1);
    MapWrapper.forEach(renderElementBinder.variableBindings, (function(mappedName, varName) {
      MapWrapper.set(protoView.protoLocals, mappedName, null);
    }));
    return elBinder;
  }
  function _bindDirectiveEvents(protoView, elementBinders) {
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; ++boundElementIndex) {
      var dirs = elementBinders[boundElementIndex].directives;
      for (var i = 0; i < dirs.length; i++) {
        var directiveBinder = dirs[i];
        protoView.bindEvent(directiveBinder.eventBindings, boundElementIndex, i);
      }
    }
  }
  $__export("getChangeDetectorDefinitions", getChangeDetectorDefinitions);
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      ChangeDetection = $__m.ChangeDetection;
      DirectiveIndex = $__m.DirectiveIndex;
      BindingRecord = $__m.BindingRecord;
      DirectiveRecord = $__m.DirectiveRecord;
      DEFAULT = $__m.DEFAULT;
      ChangeDetectorDefinition = $__m.ChangeDetectorDefinition;
    }, function($__m) {
      renderApi = $__m;
    }, function($__m) {
      AppProtoView = $__m.AppProtoView;
    }, function($__m) {
      ProtoElementInjector = $__m.ProtoElementInjector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      BindingRecordsCreator = (function() {
        function BindingRecordsCreator() {
          this._directiveRecordsMap = MapWrapper.create();
          this._textNodeIndex = 0;
        }
        return ($traceurRuntime.createClass)(BindingRecordsCreator, {
          getBindingRecords: function(elementBinders, allDirectiveMetadatas) {
            var bindings = [];
            for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; boundElementIndex++) {
              var renderElementBinder = elementBinders[boundElementIndex];
              this._createTextNodeRecords(bindings, renderElementBinder);
              this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
              this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives, allDirectiveMetadatas);
            }
            return bindings;
          },
          getDirectiveRecords: function(elementBinders, allDirectiveMetadatas) {
            var directiveRecords = [];
            for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
              var dirs = elementBinders[elementIndex].directives;
              for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
                ListWrapper.push(directiveRecords, this._getDirectiveRecord(elementIndex, dirIndex, allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
              }
            }
            return directiveRecords;
          },
          _createTextNodeRecords: function(bindings, renderElementBinder) {
            var $__0 = this;
            if (isBlank(renderElementBinder.textBindings))
              return ;
            ListWrapper.forEach(renderElementBinder.textBindings, (function(b) {
              ListWrapper.push(bindings, BindingRecord.createForTextNode(b, $__0._textNodeIndex++));
            }));
          },
          _createElementPropertyRecords: function(bindings, boundElementIndex, renderElementBinder) {
            MapWrapper.forEach(renderElementBinder.propertyBindings, (function(astWithSource, propertyName) {
              ListWrapper.push(bindings, BindingRecord.createForElement(astWithSource, boundElementIndex, propertyName));
            }));
          },
          _createDirectiveRecords: function(bindings, boundElementIndex, directiveBinders, allDirectiveMetadatas) {
            var $__0 = this;
            for (var i = 0; i < directiveBinders.length; i++) {
              var directiveBinder = directiveBinders[i];
              var directiveMetadata = allDirectiveMetadatas[directiveBinder.directiveIndex];
              MapWrapper.forEach(directiveBinder.propertyBindings, (function(astWithSource, propertyName) {
                var setter = reflector.setter(propertyName);
                var directiveRecord = $__0._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
                ListWrapper.push(bindings, BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord));
              }));
              MapWrapper.forEach(directiveBinder.hostPropertyBindings, (function(astWithSource, propertyName) {
                var dirIndex = new DirectiveIndex(boundElementIndex, i);
                ListWrapper.push(bindings, BindingRecord.createForHostProperty(dirIndex, astWithSource, propertyName));
              }));
            }
          },
          _getDirectiveRecord: function(boundElementIndex, directiveIndex, directiveMetadata) {
            var id = boundElementIndex * 100 + directiveIndex;
            if (!MapWrapper.contains(this._directiveRecordsMap, id)) {
              var changeDetection = directiveMetadata.changeDetection;
              MapWrapper.set(this._directiveRecordsMap, id, new DirectiveRecord(new DirectiveIndex(boundElementIndex, directiveIndex), directiveMetadata.callOnAllChangesDone, directiveMetadata.callOnChange, changeDetection));
            }
            return MapWrapper.get(this._directiveRecordsMap, id);
          }
        }, {});
      }());
      ProtoViewFactory = (($traceurRuntime.createClass)(function(changeDetection) {
        this._changeDetection = changeDetection;
      }, {createAppProtoViews: function(hostComponentBinding, rootRenderProtoView, allDirectives) {
          var $__0 = this;
          var allRenderDirectiveMetadata = ListWrapper.map(allDirectives, (function(directiveBinding) {
            return directiveBinding.metadata;
          }));
          var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
          var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
          var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex, nestedPvVariableBindings);
          var changeDetectorDefs = _getChangeDetectorDefinitions(hostComponentBinding.metadata, nestedPvsWithIndex, nestedPvVariableNames, allRenderDirectiveMetadata);
          var protoChangeDetectors = ListWrapper.map(changeDetectorDefs, (function(changeDetectorDef) {
            return $__0._changeDetection.createProtoChangeDetector(changeDetectorDef);
          }));
          var appProtoViews = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
          ListWrapper.forEach(nestedPvsWithIndex, (function(pvWithIndex) {
            var appProtoView = _createAppProtoView(pvWithIndex.renderProtoView, protoChangeDetectors[pvWithIndex.index], nestedPvVariableBindings[pvWithIndex.index], allDirectives);
            if (isPresent(pvWithIndex.parentIndex)) {
              var parentView = appProtoViews[pvWithIndex.parentIndex];
              parentView.elementBinders[pvWithIndex.boundElementIndex].nestedProtoView = appProtoView;
            }
            appProtoViews[pvWithIndex.index] = appProtoView;
          }));
          return appProtoViews;
        }}, {}));
      $__export("ProtoViewFactory", ProtoViewFactory);
      $__export("ProtoViewFactory", ProtoViewFactory = __decorate([Injectable(), __metadata('design:paramtypes', [ChangeDetection])], ProtoViewFactory));
      RenderProtoViewWithIndex = (function() {
        function RenderProtoViewWithIndex(renderProtoView, index, parentIndex, boundElementIndex) {
          this.renderProtoView = renderProtoView;
          this.index = index;
          this.parentIndex = parentIndex;
          this.boundElementIndex = boundElementIndex;
        }
        return ($traceurRuntime.createClass)(RenderProtoViewWithIndex, {}, {});
      }());
      ParentProtoElementInjectorWithDistance = (function() {
        function ParentProtoElementInjectorWithDistance(protoElementInjector, distance) {
          this.protoElementInjector = protoElementInjector;
          this.distance = distance;
        }
        return ($traceurRuntime.createClass)(ParentProtoElementInjectorWithDistance, {}, {});
      }());
    }
  };
});

System.register("angular2/src/services/url_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/services/url_resolver";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      isBlank,
      RegExpWrapper,
      BaseException,
      DOM,
      UrlResolver,
      _schemeRe;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      RegExpWrapper = $__m.RegExpWrapper;
      BaseException = $__m.BaseException;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      UrlResolver = (($traceurRuntime.createClass)(function() {
        if (isBlank(UrlResolver.a)) {
          UrlResolver.a = DOM.createElement('a');
        }
      }, {resolve: function(baseUrl, url) {
          if (isBlank(baseUrl)) {
            DOM.resolveAndSetHref(UrlResolver.a, url, null);
            return DOM.getHref(UrlResolver.a);
          }
          if (isBlank(url) || url == '')
            return baseUrl;
          if (url[0] == '/') {
            throw new BaseException(("Could not resolve the url " + url + " from " + baseUrl));
          }
          var m = RegExpWrapper.firstMatch(_schemeRe, url);
          if (isPresent(m[1])) {
            return url;
          }
          DOM.resolveAndSetHref(UrlResolver.a, baseUrl, url);
          return DOM.getHref(UrlResolver.a);
        }}, {}));
      $__export("UrlResolver", UrlResolver);
      $__export("UrlResolver", UrlResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], UrlResolver));
      _schemeRe = RegExpWrapper.create('^([^:/?#]+:)?');
    }
  };
});

System.register("angular2/src/core/exception_handler", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/exception_handler";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      ListWrapper,
      isListLikeIterable,
      DOM,
      ExceptionHandler;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      isListLikeIterable = $__m.isListLikeIterable;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ExceptionHandler = (($traceurRuntime.createClass)(function() {}, {call: function(error) {
          var stackTrace = arguments[1] !== (void 0) ? arguments[1] : null;
          var reason = arguments[2] !== (void 0) ? arguments[2] : null;
          var longStackTrace = isListLikeIterable(stackTrace) ? ListWrapper.join(stackTrace, "\n\n") : stackTrace;
          var reasonStr = isPresent(reason) ? ("\n" + reason) : '';
          DOM.logError(("" + error + reasonStr + "\nSTACKTRACE:\n" + longStackTrace));
        }}, {}));
      $__export("ExceptionHandler", ExceptionHandler);
      $__export("ExceptionHandler", ExceptionHandler = __decorate([Injectable(), __metadata('design:paramtypes', [])], ExceptionHandler));
    }
  };
});

System.register("angular2/src/services/xhr", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/services/xhr";
  var XHR;
  return {
    setters: [],
    execute: function() {
      XHR = (function() {
        function XHR() {}
        return ($traceurRuntime.createClass)(XHR, {get: function(url) {
            return null;
          }}, {});
      }());
      $__export("XHR", XHR);
    }
  };
});

System.register("angular2/src/core/zone/ng_zone", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/zone/ng_zone";
  var StringMapWrapper,
      normalizeBlank,
      isPresent,
      global,
      NgZone;
  return {
    setters: [function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      normalizeBlank = $__m.normalizeBlank;
      isPresent = $__m.isPresent;
      global = $__m.global;
    }],
    execute: function() {
      NgZone = (function() {
        function NgZone($__1) {
          var enableLongStackTrace = $__1.enableLongStackTrace;
          this._onTurnStart = null;
          this._onTurnDone = null;
          this._onErrorHandler = null;
          this._pendingMicrotasks = 0;
          this._hasExecutedCodeInInnerZone = false;
          this._nestedRun = 0;
          if (global.zone) {
            this._disabled = false;
            this._mountZone = global.zone;
            this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace);
          } else {
            this._disabled = true;
            this._mountZone = null;
          }
        }
        return ($traceurRuntime.createClass)(NgZone, {
          initCallbacks: function() {
            var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
                onTurnStart = $__1.onTurnStart,
                onTurnDone = $__1.onTurnDone,
                onErrorHandler = $__1.onErrorHandler;
            this._onTurnStart = normalizeBlank(onTurnStart);
            this._onTurnDone = normalizeBlank(onTurnDone);
            this._onErrorHandler = normalizeBlank(onErrorHandler);
          },
          run: function(fn) {
            if (this._disabled) {
              return fn();
            } else {
              return this._innerZone.run(fn);
            }
          },
          runOutsideAngular: function(fn) {
            if (this._disabled) {
              return fn();
            } else {
              return this._mountZone.run(fn);
            }
          },
          _createInnerZone: function(zone, enableLongStackTrace) {
            var ngZone = this;
            var errorHandling;
            if (enableLongStackTrace) {
              errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, {onError: function(e) {
                  ngZone._onError(this, e);
                }});
            } else {
              errorHandling = {onError: function(e) {
                  ngZone._onError(this, e);
                }};
            }
            return zone.fork(errorHandling).fork({
              '$run': function(parentRun) {
                return function() {
                  try {
                    ngZone._nestedRun++;
                    if (!ngZone._hasExecutedCodeInInnerZone) {
                      ngZone._hasExecutedCodeInInnerZone = true;
                      if (ngZone._onTurnStart) {
                        parentRun.call(ngZone._innerZone, ngZone._onTurnStart);
                      }
                    }
                    return parentRun.apply(this, arguments);
                  } finally {
                    ngZone._nestedRun--;
                    if (ngZone._pendingMicrotasks == 0 && ngZone._nestedRun == 0) {
                      if (ngZone._onTurnDone && ngZone._hasExecutedCodeInInnerZone) {
                        try {
                          parentRun.call(ngZone._innerZone, ngZone._onTurnDone);
                        } finally {
                          ngZone._hasExecutedCodeInInnerZone = false;
                        }
                      }
                    }
                  }
                };
              },
              '$scheduleMicrotask': function(parentScheduleMicrotask) {
                return function(fn) {
                  ngZone._pendingMicrotasks++;
                  var microtask = function() {
                    try {
                      fn();
                    } finally {
                      ngZone._pendingMicrotasks--;
                    }
                  };
                  parentScheduleMicrotask.call(this, microtask);
                };
              },
              _innerZone: true
            });
          },
          _onError: function(zone, e) {
            if (isPresent(this._onErrorHandler)) {
              var trace = [normalizeBlank(e.stack)];
              while (zone && zone.constructedAtException) {
                trace.push(zone.constructedAtException.get());
                zone = zone.parent;
              }
              this._onErrorHandler(e, trace);
            } else {
              console.log('## _onError ##');
              console.log(e.stack);
              throw e;
            }
          }
        }, {});
      }());
      $__export("NgZone", NgZone);
    }
  };
});

System.register("angular2/src/core/life_cycle/life_cycle", ["angular2/di", "angular2/change_detection", "angular2/src/core/exception_handler", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/life_cycle/life_cycle";
  var __decorate,
      __metadata,
      Injectable,
      ChangeDetector,
      ExceptionHandler,
      isPresent,
      LifeCycle;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ChangeDetector = $__m.ChangeDetector;
    }, function($__m) {
      ExceptionHandler = $__m.ExceptionHandler;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      LifeCycle = (($traceurRuntime.createClass)(function(exceptionHandler) {
        var changeDetector = arguments[1] !== (void 0) ? arguments[1] : null;
        var enforceNoNewChanges = arguments[2] !== (void 0) ? arguments[2] : false;
        this._errorHandler = (function(exception, stackTrace) {
          exceptionHandler.call(exception, stackTrace);
          throw exception;
        });
        this._changeDetector = changeDetector;
        this._enforceNoNewChanges = enforceNoNewChanges;
      }, {
        registerWith: function(zone) {
          var changeDetector = arguments[1] !== (void 0) ? arguments[1] : null;
          var $__0 = this;
          if (isPresent(changeDetector)) {
            this._changeDetector = changeDetector;
          }
          zone.initCallbacks({
            onErrorHandler: this._errorHandler,
            onTurnDone: (function() {
              return $__0.tick();
            })
          });
        },
        tick: function() {
          this._changeDetector.detectChanges();
          if (this._enforceNoNewChanges) {
            this._changeDetector.checkNoChanges();
          }
        }
      }, {}));
      $__export("LifeCycle", LifeCycle);
      $__export("LifeCycle", LifeCycle = __decorate([Injectable(), __metadata('design:paramtypes', [ExceptionHandler, ChangeDetector, Boolean])], LifeCycle));
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_dom_strategy", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_dom_strategy";
  var ShadowDomStrategy;
  return {
    setters: [],
    execute: function() {
      ShadowDomStrategy = (function() {
        function ShadowDomStrategy() {}
        return ($traceurRuntime.createClass)(ShadowDomStrategy, {
          hasNativeContentElement: function() {
            return true;
          },
          prepareShadowRoot: function(el) {
            return null;
          },
          constructLightDom: function(lightDomView, el) {
            return null;
          },
          processStyleElement: function(hostComponentId, templateUrl, styleElement) {
            return null;
          },
          processElement: function(hostComponentId, elementComponentId, element) {}
        }, {});
      }());
      $__export("ShadowDomStrategy", ShadowDomStrategy);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/light_dom", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/light_dom";
  var DOM,
      ListWrapper,
      isPresent,
      DestinationLightDom,
      _Root,
      LightDom;
  function redistributeNodes(contents, nodes) {
    for (var i = 0; i < contents.length; ++i) {
      var content = contents[i];
      var select = content.select;
      if (select.length === 0) {
        content.insert(ListWrapper.clone(nodes));
        ListWrapper.clear(nodes);
      } else {
        var matchSelector = (function(n) {
          return DOM.elementMatches(n, select);
        });
        var matchingNodes = ListWrapper.filter(nodes, matchSelector);
        content.insert(matchingNodes);
        ListWrapper.removeAll(nodes, matchingNodes);
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (isPresent(node.parentNode)) {
        DOM.remove(nodes[i]);
      }
    }
  }
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      DestinationLightDom = (function() {
        function DestinationLightDom() {}
        return ($traceurRuntime.createClass)(DestinationLightDom, {}, {});
      }());
      $__export("DestinationLightDom", DestinationLightDom);
      _Root = (function() {
        function _Root(node, boundElementIndex) {
          this.node = node;
          this.boundElementIndex = boundElementIndex;
        }
        return ($traceurRuntime.createClass)(_Root, {}, {});
      }());
      LightDom = (function() {
        function LightDom(lightDomView, element) {
          this.lightDomView = lightDomView;
          this.nodes = DOM.childNodesAsList(element);
          this._roots = null;
          this.shadowDomView = null;
        }
        return ($traceurRuntime.createClass)(LightDom, {
          attachShadowDomView: function(shadowDomView) {
            this.shadowDomView = shadowDomView;
          },
          detachShadowDomView: function() {
            this.shadowDomView = null;
          },
          redistribute: function() {
            redistributeNodes(this.contentTags(), this.expandedDomNodes());
          },
          contentTags: function() {
            if (isPresent(this.shadowDomView)) {
              return this._collectAllContentTags(this.shadowDomView, []);
            } else {
              return [];
            }
          },
          _collectAllContentTags: function(view, acc) {
            var $__0 = this;
            var contentTags = view.contentTags;
            var vcs = view.viewContainers;
            for (var i = 0; i < vcs.length; i++) {
              var vc = vcs[i];
              var contentTag = contentTags[i];
              if (isPresent(contentTag)) {
                ListWrapper.push(acc, contentTag);
              }
              if (isPresent(vc)) {
                ListWrapper.forEach(vc.contentTagContainers(), (function(view) {
                  $__0._collectAllContentTags(view, acc);
                }));
              }
            }
            return acc;
          },
          expandedDomNodes: function() {
            var res = [];
            var roots = this._findRoots();
            for (var i = 0; i < roots.length; ++i) {
              var root = roots[i];
              if (isPresent(root.boundElementIndex)) {
                var vc = this.lightDomView.viewContainers[root.boundElementIndex];
                var content = this.lightDomView.contentTags[root.boundElementIndex];
                if (isPresent(vc)) {
                  res = ListWrapper.concat(res, vc.nodes());
                } else if (isPresent(content)) {
                  res = ListWrapper.concat(res, content.nodes());
                } else {
                  ListWrapper.push(res, root.node);
                }
              } else {
                ListWrapper.push(res, root.node);
              }
            }
            return res;
          },
          _findRoots: function() {
            if (isPresent(this._roots))
              return this._roots;
            var boundElements = this.lightDomView.boundElements;
            this._roots = ListWrapper.map(this.nodes, (function(n) {
              var boundElementIndex = null;
              for (var i = 0; i < boundElements.length; i++) {
                var boundEl = boundElements[i];
                if (isPresent(boundEl) && boundEl === n) {
                  boundElementIndex = i;
                  break;
                }
              }
              return new _Root(n, boundElementIndex);
            }));
            return this._roots;
          }
        }, {});
      }());
      $__export("LightDom", LightDom);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_css", ["angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_css";
  var DOM,
      ListWrapper,
      StringWrapper,
      RegExpWrapper,
      RegExpMatcherWrapper,
      isPresent,
      isBlank,
      ShadowCss,
      _cssContentNextSelectorRe,
      _cssContentRuleRe,
      _cssContentUnscopedRuleRe,
      _polyfillHost,
      _polyfillHostContext,
      _parenSuffix,
      _cssColonHostRe,
      _cssColonHostContextRe,
      _polyfillHostNoCombinator,
      _shadowDOMSelectorsRe,
      _selectorReSuffix,
      _polyfillHostRe,
      _colonHostRe,
      _colonHostContextRe;
  function _cssToRules(cssText) {
    return DOM.cssToRules(cssText);
  }
  function _withCssRules(cssText, callback) {
    if (isBlank(callback))
      return ;
    var rules = _cssToRules(cssText);
    callback(rules);
  }
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
      RegExpMatcherWrapper = $__m.RegExpMatcherWrapper;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      ShadowCss = (function() {
        function ShadowCss() {
          this.strictStyling = true;
        }
        return ($traceurRuntime.createClass)(ShadowCss, {
          shimStyle: function(style, selector) {
            var hostSelector = arguments[2] !== (void 0) ? arguments[2] : '';
            var cssText = DOM.getText(style);
            return this.shimCssText(cssText, selector, hostSelector);
          },
          shimCssText: function(cssText, selector) {
            var hostSelector = arguments[2] !== (void 0) ? arguments[2] : '';
            cssText = this._insertDirectives(cssText);
            return this._scopeCssText(cssText, selector, hostSelector);
          },
          _insertDirectives: function(cssText) {
            cssText = this._insertPolyfillDirectivesInCssText(cssText);
            return this._insertPolyfillRulesInCssText(cssText);
          },
          _insertPolyfillDirectivesInCssText: function(cssText) {
            return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function(m) {
              return m[1] + '{';
            });
          },
          _insertPolyfillRulesInCssText: function(cssText) {
            return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function(m) {
              var rule = m[0];
              rule = StringWrapper.replace(rule, m[1], '');
              rule = StringWrapper.replace(rule, m[2], '');
              return m[3] + rule;
            });
          },
          _scopeCssText: function(cssText, scopeSelector, hostSelector) {
            var $__0 = this;
            var unscoped = this._extractUnscopedRulesFromCssText(cssText);
            cssText = this._insertPolyfillHostInCssText(cssText);
            cssText = this._convertColonHost(cssText);
            cssText = this._convertColonHostContext(cssText);
            cssText = this._convertShadowDOMSelectors(cssText);
            if (isPresent(scopeSelector)) {
              _withCssRules(cssText, (function(rules) {
                cssText = $__0._scopeRules(rules, scopeSelector, hostSelector);
              }));
            }
            cssText = cssText + '\n' + unscoped;
            return cssText.trim();
          },
          _extractUnscopedRulesFromCssText: function(cssText) {
            var r = '',
                m;
            var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
            while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
              var rule = m[0];
              rule = StringWrapper.replace(rule, m[2], '');
              rule = StringWrapper.replace(rule, m[1], m[3]);
              r = rule + '\n\n';
            }
            return r;
          },
          _convertColonHost: function(cssText) {
            return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
          },
          _convertColonHostContext: function(cssText) {
            return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
          },
          _convertColonRule: function(cssText, regExp, partReplacer) {
            return StringWrapper.replaceAllMapped(cssText, regExp, function(m) {
              if (isPresent(m[2])) {
                var parts = m[2].split(','),
                    r = [];
                for (var i = 0; i < parts.length; i++) {
                  var p = parts[i];
                  if (isBlank(p))
                    break;
                  p = p.trim();
                  ListWrapper.push(r, partReplacer(_polyfillHostNoCombinator, p, m[3]));
                }
                return r.join(',');
              } else {
                return _polyfillHostNoCombinator + m[3];
              }
            });
          },
          _colonHostContextPartReplacer: function(host, part, suffix) {
            if (StringWrapper.contains(part, _polyfillHost)) {
              return this._colonHostPartReplacer(host, part, suffix);
            } else {
              return host + part + suffix + ', ' + part + ' ' + host + suffix;
            }
          },
          _colonHostPartReplacer: function(host, part, suffix) {
            return host + StringWrapper.replace(part, _polyfillHost, '') + suffix;
          },
          _convertShadowDOMSelectors: function(cssText) {
            for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
              cssText = StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
            }
            return cssText;
          },
          _scopeRules: function(cssRules, scopeSelector, hostSelector) {
            var cssText = '';
            if (isPresent(cssRules)) {
              for (var i = 0; i < cssRules.length; i++) {
                var rule = cssRules[i];
                if (DOM.isStyleRule(rule) || DOM.isPageRule(rule)) {
                  cssText += this._scopeSelector(rule.selectorText, scopeSelector, hostSelector, this.strictStyling) + ' {\n';
                  cssText += this._propertiesFromRule(rule) + '\n}\n\n';
                } else if (DOM.isMediaRule(rule)) {
                  cssText += '@media ' + rule.media.mediaText + ' {\n';
                  cssText += this._scopeRules(rule.cssRules, scopeSelector, hostSelector);
                  cssText += '\n}\n\n';
                } else {
                  try {
                    if (isPresent(rule.cssText)) {
                      cssText += rule.cssText + '\n\n';
                    }
                  } catch (x) {
                    if (DOM.isKeyframesRule(rule) && isPresent(rule.cssRules)) {
                      cssText += this._ieSafeCssTextFromKeyFrameRule(rule);
                    }
                  }
                }
              }
            }
            return cssText;
          },
          _ieSafeCssTextFromKeyFrameRule: function(rule) {
            var cssText = '@keyframes ' + rule.name + ' {';
            for (var i = 0; i < rule.cssRules.length; i++) {
              var r = rule.cssRules[i];
              cssText += ' ' + r.keyText + ' {' + r.style.cssText + '}';
            }
            cssText += ' }';
            return cssText;
          },
          _scopeSelector: function(selector, scopeSelector, hostSelector, strict) {
            var r = [],
                parts = selector.split(',');
            for (var i = 0; i < parts.length; i++) {
              var p = parts[i];
              p = p.trim();
              if (this._selectorNeedsScoping(p, scopeSelector)) {
                p = strict && !StringWrapper.contains(p, _polyfillHostNoCombinator) ? this._applyStrictSelectorScope(p, scopeSelector) : this._applySelectorScope(p, scopeSelector, hostSelector);
              }
              ListWrapper.push(r, p);
            }
            return r.join(', ');
          },
          _selectorNeedsScoping: function(selector, scopeSelector) {
            var re = this._makeScopeMatcher(scopeSelector);
            return !isPresent(RegExpWrapper.firstMatch(re, selector));
          },
          _makeScopeMatcher: function(scopeSelector) {
            var lre = RegExpWrapper.create('\\[');
            var rre = RegExpWrapper.create('\\]');
            scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, '\\[');
            scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, '\\]');
            return RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
          },
          _applySelectorScope: function(selector, scopeSelector, hostSelector) {
            return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
          },
          _applySimpleSelectorScope: function(selector, scopeSelector, hostSelector) {
            if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
              var replaceBy = this.strictStyling ? ("[" + hostSelector + "]") : scopeSelector;
              selector = StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
              return StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
            } else {
              return scopeSelector + ' ' + selector;
            }
          },
          _applyStrictSelectorScope: function(selector, scopeSelector) {
            var isRe = RegExpWrapper.create('\\[is=([^\\]]*)\\]');
            scopeSelector = StringWrapper.replaceAllMapped(scopeSelector, isRe, (function(m) {
              return m[1];
            }));
            var splits = [' ', '>', '+', '~'],
                scoped = selector,
                attrName = '[' + scopeSelector + ']';
            for (var i = 0; i < splits.length; i++) {
              var sep = splits[i];
              var parts = scoped.split(sep);
              scoped = ListWrapper.map(parts, function(p) {
                var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                if (t.length > 0 && !ListWrapper.contains(splits, t) && !StringWrapper.contains(t, attrName)) {
                  var re = RegExpWrapper.create('([^:]*)(:*)(.*)');
                  var m = RegExpWrapper.firstMatch(re, t);
                  if (isPresent(m)) {
                    p = m[1] + attrName + m[2] + m[3];
                  }
                }
                return p;
              }).join(sep);
            }
            return scoped;
          },
          _insertPolyfillHostInCssText: function(selector) {
            selector = StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
            selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
            return selector;
          },
          _propertiesFromRule: function(rule) {
            var cssText = rule.style.cssText;
            var attrRe = RegExpWrapper.create('[\'"]+|attr');
            if (rule.style.content.length > 0 && !isPresent(RegExpWrapper.firstMatch(attrRe, rule.style.content))) {
              var contentRe = RegExpWrapper.create('content:[^;]*;');
              cssText = StringWrapper.replaceAll(cssText, contentRe, 'content: \'' + rule.style.content + '\';');
            }
            return cssText;
          }
        }, {});
      }());
      $__export("ShadowCss", ShadowCss);
      _cssContentNextSelectorRe = RegExpWrapper.create('polyfill-next-selector[^}]*content:[\\s]*?[\'"](.*?)[\'"][;\\s]*}([^{]*?){', 'im');
      _cssContentRuleRe = RegExpWrapper.create('(polyfill-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
      _cssContentUnscopedRuleRe = RegExpWrapper.create('(polyfill-unscoped-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
      _polyfillHost = '-shadowcsshost';
      _polyfillHostContext = '-shadowcsscontext';
      _parenSuffix = ')(?:\\((' + '(?:\\([^)(]*\\)|[^)(]*)+?' + ')\\))?([^,{]*)';
      _cssColonHostRe = RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
      _cssColonHostContextRe = RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
      _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
      _shadowDOMSelectorsRe = [RegExpWrapper.create('>>>'), RegExpWrapper.create('::shadow'), RegExpWrapper.create('::content'), RegExpWrapper.create('/deep/'), RegExpWrapper.create('/shadow-deep/'), RegExpWrapper.create('/shadow/')];
      _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
      _polyfillHostRe = RegExpWrapper.create(_polyfillHost, 'im');
      _colonHostRe = RegExpWrapper.create(':host', 'im');
      _colonHostContextRe = RegExpWrapper.create(':host-context', 'im');
    }
  };
});

System.register("angular2/src/services/xhr_impl", ["angular2/di", "angular2/src/facade/async", "angular2/src/services/xhr"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/services/xhr_impl";
  var __decorate,
      __metadata,
      Injectable,
      PromiseWrapper,
      XHR,
      XHRImpl;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      XHR = $__m.XHR;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      XHRImpl = (function($__super) {
        function $__0() {
          $traceurRuntime.superConstructor($__0).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)($__0, {get: function(url) {
            var completer = PromiseWrapper.completer();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.onload = function() {
              var status = xhr.status;
              if (200 <= status && status <= 300) {
                completer.resolve(xhr.responseText);
              } else {
                completer.reject(("Failed to load " + url), null);
              }
            };
            xhr.onerror = function() {
              completer.reject(("Failed to load " + url), null);
            };
            xhr.send();
            return completer.promise;
          }}, {}, $__super);
      }(XHR));
      $__export("XHRImpl", XHRImpl);
      $__export("XHRImpl", XHRImpl = __decorate([Injectable(), __metadata('design:paramtypes', [])], XHRImpl));
    }
  };
});

System.register("angular2/src/render/dom/events/event_manager", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/event_manager";
  var BaseException,
      StringWrapper,
      DOM,
      BUBBLE_SYMBOL,
      EventManager,
      EventManagerPlugin,
      DomEventsPlugin;
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      BUBBLE_SYMBOL = '^';
      EventManager = (function() {
        function EventManager(plugins, zone) {
          this._zone = zone;
          this._plugins = plugins;
          for (var i = 0; i < plugins.length; i++) {
            plugins[i].manager = this;
          }
        }
        return ($traceurRuntime.createClass)(EventManager, {
          addEventListener: function(element, eventName, handler) {
            var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
            var plugin = this._findPluginFor(withoutBubbleSymbol);
            plugin.addEventListener(element, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
          },
          addGlobalEventListener: function(target, eventName, handler) {
            var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
            var plugin = this._findPluginFor(withoutBubbleSymbol);
            return plugin.addGlobalEventListener(target, withoutBubbleSymbol, handler, withoutBubbleSymbol != eventName);
          },
          getZone: function() {
            return this._zone;
          },
          _findPluginFor: function(eventName) {
            var plugins = this._plugins;
            for (var i = 0; i < plugins.length; i++) {
              var plugin = plugins[i];
              if (plugin.supports(eventName)) {
                return plugin;
              }
            }
            throw new BaseException(("No event manager plugin found for event " + eventName));
          },
          _removeBubbleSymbol: function(eventName) {
            return eventName[0] == BUBBLE_SYMBOL ? StringWrapper.substring(eventName, 1) : eventName;
          }
        }, {});
      }());
      $__export("EventManager", EventManager);
      EventManagerPlugin = (function() {
        function EventManagerPlugin() {}
        return ($traceurRuntime.createClass)(EventManagerPlugin, {
          supports: function(eventName) {
            return false;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            throw "not implemented";
          },
          addGlobalEventListener: function(element, eventName, handler, shouldSupportBubble) {
            throw "not implemented";
          }
        }, {});
      }());
      $__export("EventManagerPlugin", EventManagerPlugin);
      DomEventsPlugin = (function($__super) {
        function DomEventsPlugin() {
          $traceurRuntime.superConstructor(DomEventsPlugin).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(DomEventsPlugin, {
          supports: function(eventName) {
            return true;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
            this.manager._zone.runOutsideAngular((function() {
              DOM.on(element, eventName, outsideHandler);
            }));
          },
          addGlobalEventListener: function(target, eventName, handler, shouldSupportBubble) {
            var element = DOM.getGlobalEventTarget(target);
            var outsideHandler = this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
            return this.manager._zone.runOutsideAngular((function() {
              return DOM.onAndCancel(element, eventName, outsideHandler);
            }));
          },
          _getOutsideHandler: function(shouldSupportBubble, element, handler, zone) {
            return shouldSupportBubble ? DomEventsPlugin.bubbleCallback(element, handler, zone) : DomEventsPlugin.sameElementCallback(element, handler, zone);
          }
        }, {
          sameElementCallback: function(element, handler, zone) {
            return (function(event) {
              if (event.target === element) {
                zone.run((function() {
                  return handler(event);
                }));
              }
            });
          },
          bubbleCallback: function(element, handler, zone) {
            return (function(event) {
              return zone.run((function() {
                return handler(event);
              }));
            });
          }
        }, $__super);
      }(EventManagerPlugin));
      $__export("DomEventsPlugin", DomEventsPlugin);
    }
  };
});

System.register("angular2/src/render/dom/events/key_events", ["angular2/src/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/render/dom/events/event_manager"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/key_events";
  var DOM,
      isPresent,
      StringWrapper,
      StringMapWrapper,
      ListWrapper,
      EventManagerPlugin,
      modifierKeys,
      modifierKeyGetters,
      KeyEventsPlugin;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isPresent = $__m.isPresent;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      EventManagerPlugin = $__m.EventManagerPlugin;
    }],
    execute: function() {
      modifierKeys = ['alt', 'control', 'meta', 'shift'];
      modifierKeyGetters = {
        'alt': (function(event) {
          return event.altKey;
        }),
        'control': (function(event) {
          return event.ctrlKey;
        }),
        'meta': (function(event) {
          return event.metaKey;
        }),
        'shift': (function(event) {
          return event.shiftKey;
        })
      };
      KeyEventsPlugin = (function($__super) {
        function KeyEventsPlugin() {
          $traceurRuntime.superConstructor(KeyEventsPlugin).call(this);
        }
        return ($traceurRuntime.createClass)(KeyEventsPlugin, {
          supports: function(eventName) {
            return isPresent(KeyEventsPlugin.parseEventName(eventName));
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
            var outsideHandler = KeyEventsPlugin.eventCallback(element, shouldSupportBubble, StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());
            this.manager.getZone().runOutsideAngular((function() {
              DOM.on(element, StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
            }));
          }
        }, {
          parseEventName: function(eventName) {
            eventName = eventName.toLowerCase();
            var parts = eventName.split('.');
            var domEventName = ListWrapper.removeAt(parts, 0);
            if ((parts.length === 0) || !(StringWrapper.equals(domEventName, 'keydown') || StringWrapper.equals(domEventName, 'keyup'))) {
              return null;
            }
            var key = ListWrapper.removeLast(parts);
            var fullKey = '';
            ListWrapper.forEach(modifierKeys, (function(modifierName) {
              if (ListWrapper.contains(parts, modifierName)) {
                ListWrapper.remove(parts, modifierName);
                fullKey += modifierName + '.';
              }
            }));
            fullKey += key;
            if (parts.length != 0 || key.length === 0) {
              return null;
            }
            return {
              'domEventName': domEventName,
              'fullKey': fullKey
            };
          },
          getEventFullKey: function(event) {
            var fullKey = '';
            var key = DOM.getEventKey(event);
            key = key.toLowerCase();
            if (StringWrapper.equals(key, ' ')) {
              key = 'space';
            } else if (StringWrapper.equals(key, '.')) {
              key = 'dot';
            }
            ListWrapper.forEach(modifierKeys, (function(modifierName) {
              if (modifierName != key) {
                var modifierGetter = StringMapWrapper.get(modifierKeyGetters, modifierName);
                if (modifierGetter(event)) {
                  fullKey += modifierName + '.';
                }
              }
            }));
            fullKey += key;
            return fullKey;
          },
          eventCallback: function(element, shouldSupportBubble, fullKey, handler, zone) {
            return (function(event) {
              var correctElement = shouldSupportBubble || event.target === element;
              if (correctElement && KeyEventsPlugin.getEventFullKey(event) === fullKey) {
                zone.run((function() {
                  return handler(event);
                }));
              }
            });
          }
        }, $__super);
      }(EventManagerPlugin));
      $__export("KeyEventsPlugin", KeyEventsPlugin);
    }
  };
});

System.register("angular2/src/render/dom/events/hammer_common", ["angular2/src/render/dom/events/event_manager", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/hammer_common";
  var EventManagerPlugin,
      StringMapWrapper,
      _eventNames,
      HammerGesturesPluginCommon;
  return {
    setters: [function($__m) {
      EventManagerPlugin = $__m.EventManagerPlugin;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      _eventNames = {
        'pan': true,
        'panstart': true,
        'panmove': true,
        'panend': true,
        'pancancel': true,
        'panleft': true,
        'panright': true,
        'panup': true,
        'pandown': true,
        'pinch': true,
        'pinchstart': true,
        'pinchmove': true,
        'pinchend': true,
        'pinchcancel': true,
        'pinchin': true,
        'pinchout': true,
        'press': true,
        'pressup': true,
        'rotate': true,
        'rotatestart': true,
        'rotatemove': true,
        'rotateend': true,
        'rotatecancel': true,
        'swipe': true,
        'swipeleft': true,
        'swiperight': true,
        'swipeup': true,
        'swipedown': true,
        'tap': true
      };
      HammerGesturesPluginCommon = (function($__super) {
        function HammerGesturesPluginCommon() {
          $traceurRuntime.superConstructor(HammerGesturesPluginCommon).call(this);
        }
        return ($traceurRuntime.createClass)(HammerGesturesPluginCommon, {supports: function(eventName) {
            eventName = eventName.toLowerCase();
            return StringMapWrapper.contains(_eventNames, eventName);
          }}, {}, $__super);
      }(EventManagerPlugin));
      $__export("HammerGesturesPluginCommon", HammerGesturesPluginCommon);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/style_url_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/services/url_resolver"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/style_url_resolver";
  var __decorate,
      __metadata,
      Injectable,
      RegExpWrapper,
      StringWrapper,
      UrlResolver,
      StyleUrlResolver,
      _cssUrlRe,
      _cssImportRe,
      _quoteRe;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      RegExpWrapper = $__m.RegExpWrapper;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      StyleUrlResolver = (($traceurRuntime.createClass)(function(resolver) {
        this._resolver = resolver;
      }, {
        resolveUrls: function(cssText, baseUrl) {
          cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
          cssText = this._replaceUrls(cssText, _cssImportRe, baseUrl);
          return cssText;
        },
        _replaceUrls: function(cssText, re, baseUrl) {
          var $__0 = this;
          return StringWrapper.replaceAllMapped(cssText, re, (function(m) {
            var pre = m[1];
            var url = StringWrapper.replaceAll(m[2], _quoteRe, '');
            var post = m[3];
            var resolvedUrl = $__0._resolver.resolve(baseUrl, url);
            return pre + "'" + resolvedUrl + "'" + post;
          }));
        }
      }, {}));
      $__export("StyleUrlResolver", StyleUrlResolver);
      $__export("StyleUrlResolver", StyleUrlResolver = __decorate([Injectable(), __metadata('design:paramtypes', [UrlResolver])], StyleUrlResolver));
      _cssUrlRe = RegExpWrapper.create('(url\\()([^)]*)(\\))');
      _cssImportRe = RegExpWrapper.create('(@import[\\s]+(?!url\\())[\'"]([^\'"]*)[\'"](.*;)');
      _quoteRe = RegExpWrapper.create('[\'"]');
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/style_inliner", ["angular2/di", "angular2/src/services/xhr", "angular2/src/facade/collection", "angular2/src/services/url_resolver", "angular2/src/render/dom/shadow_dom/style_url_resolver", "angular2/src/facade/lang", "angular2/src/facade/async"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/style_inliner";
  var __decorate,
      __metadata,
      Injectable,
      XHR,
      ListWrapper,
      UrlResolver,
      StyleUrlResolver,
      isBlank,
      isPresent,
      RegExpWrapper,
      StringWrapper,
      PromiseWrapper,
      StyleInliner,
      _importRe,
      _urlRe,
      _mediaQueryRe;
  function _extractUrl(importRule) {
    var match = RegExpWrapper.firstMatch(_urlRe, importRule);
    if (isBlank(match))
      return null;
    return isPresent(match[1]) ? match[1] : match[2];
  }
  function _extractMediaQuery(importRule) {
    var match = RegExpWrapper.firstMatch(_mediaQueryRe, importRule);
    if (isBlank(match))
      return null;
    var mediaQuery = match[1].trim();
    return (mediaQuery.length > 0) ? mediaQuery : null;
  }
  function _wrapInMediaRule(css, query) {
    return (isBlank(query)) ? css : ("@media " + query + " {\n" + css + "\n}");
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      StyleUrlResolver = $__m.StyleUrlResolver;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      RegExpWrapper = $__m.RegExpWrapper;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      StyleInliner = (($traceurRuntime.createClass)(function(xhr, styleUrlResolver, urlResolver) {
        this._xhr = xhr;
        this._urlResolver = urlResolver;
        this._styleUrlResolver = styleUrlResolver;
      }, {
        inlineImports: function(cssText, baseUrl) {
          return this._inlineImports(cssText, baseUrl, []);
        },
        _inlineImports: function(cssText, baseUrl, inlinedUrls) {
          var $__0 = this;
          var partIndex = 0;
          var parts = StringWrapper.split(cssText, _importRe);
          if (parts.length === 1) {
            return cssText;
          }
          var promises = [];
          while (partIndex < parts.length - 1) {
            var prefix = parts[partIndex];
            var rule = parts[partIndex + 1];
            var url = _extractUrl(rule);
            if (isPresent(url)) {
              url = this._urlResolver.resolve(baseUrl, url);
            }
            var mediaQuery = _extractMediaQuery(rule);
            var promise = void 0;
            if (isBlank(url)) {
              promise = PromiseWrapper.resolve(("/* Invalid import rule: \"@import " + rule + ";\" */"));
            } else if (ListWrapper.contains(inlinedUrls, url)) {
              promise = PromiseWrapper.resolve(prefix);
            } else {
              ListWrapper.push(inlinedUrls, url);
              promise = PromiseWrapper.then(this._xhr.get(url), (function(rawCss) {
                var inlinedCss = $__0._inlineImports(rawCss, url, inlinedUrls);
                if (PromiseWrapper.isPromise(inlinedCss)) {
                  return inlinedCss.then((function(css) {
                    return prefix + $__0._transformImportedCss(css, mediaQuery, url) + '\n';
                  }));
                } else {
                  return prefix + $__0._transformImportedCss(inlinedCss, mediaQuery, url) + '\n';
                }
              }), (function(error) {
                return ("/* failed to import " + url + " */\n");
              }));
            }
            ListWrapper.push(promises, promise);
            partIndex += 2;
          }
          return PromiseWrapper.all(promises).then(function(cssParts) {
            var cssText = cssParts.join('');
            if (partIndex < parts.length) {
              cssText += parts[partIndex];
            }
            return cssText;
          });
        },
        _transformImportedCss: function(css, mediaQuery, url) {
          css = this._styleUrlResolver.resolveUrls(css, url);
          return _wrapInMediaRule(css, mediaQuery);
        }
      }, {}));
      $__export("StyleInliner", StyleInliner);
      $__export("StyleInliner", StyleInliner = __decorate([Injectable(), __metadata('design:paramtypes', [XHR, StyleUrlResolver, UrlResolver])], StyleInliner));
      _importRe = RegExpWrapper.create('@import\\s+([^;]+);');
      _urlRe = RegExpWrapper.create('url\\(\\s*?[\'"]?([^\'")]+)[\'"]?|' + '[\'"]([^\'")]+)[\'"]');
      _mediaQueryRe = RegExpWrapper.create('[\'"][^\'"]+[\'"]\\s*\\)?\\s*(.*)');
    }
  };
});

System.register("angular2/src/core/compiler/dynamic_component_loader", ["angular2/di", "angular2/src/core/compiler/compiler", "angular2/src/facade/lang", "angular2/src/core/compiler/view_manager", "angular2/src/core/compiler/element_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/dynamic_component_loader";
  var __decorate,
      __metadata,
      Binding,
      bind,
      Injectable,
      Compiler,
      BaseException,
      AppViewManager,
      ElementRef,
      ComponentRef,
      DynamicComponentLoader;
  return {
    setters: [function($__m) {
      Binding = $__m.Binding;
      bind = $__m.bind;
      Injectable = $__m.Injectable;
    }, function($__m) {
      Compiler = $__m.Compiler;
    }, function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      AppViewManager = $__m.AppViewManager;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ComponentRef = (function() {
        function ComponentRef(location, instance, dispose) {
          this.location = location;
          this.instance = instance;
          this.dispose = dispose;
        }
        return ($traceurRuntime.createClass)(ComponentRef, {get hostView() {
            return this.location.parentView;
          }}, {});
      }());
      $__export("ComponentRef", ComponentRef);
      DynamicComponentLoader = (($traceurRuntime.createClass)(function(compiler, viewManager) {
        this._compiler = compiler;
        this._viewManager = viewManager;
      }, {
        loadIntoExistingLocation: function(typeOrBinding, location) {
          var injector = arguments[2] !== (void 0) ? arguments[2] : null;
          var $__0 = this;
          var binding = this._getBinding(typeOrBinding);
          return this._compiler.compile(binding.token).then((function(componentProtoViewRef) {
            $__0._viewManager.createDynamicComponentView(location, componentProtoViewRef, binding, injector);
            var component = $__0._viewManager.getComponent(location);
            var dispose = (function() {
              throw new BaseException("Not implemented");
            });
            return new ComponentRef(location, component, dispose);
          }));
        },
        loadAsRoot: function(typeOrBinding) {
          var overrideSelector = arguments[1] !== (void 0) ? arguments[1] : null;
          var injector = arguments[2] !== (void 0) ? arguments[2] : null;
          var $__0 = this;
          return this._compiler.compileInHost(this._getBinding(typeOrBinding)).then((function(hostProtoViewRef) {
            var hostViewRef = $__0._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
            var newLocation = new ElementRef(hostViewRef, 0);
            var component = $__0._viewManager.getComponent(newLocation);
            var dispose = (function() {
              $__0._viewManager.destroyRootHostView(hostViewRef);
            });
            return new ComponentRef(newLocation, component, dispose);
          }));
        },
        loadIntoNewLocation: function(typeOrBinding, parentComponentLocation) {
          var injector = arguments[2] !== (void 0) ? arguments[2] : null;
          var $__0 = this;
          return this._compiler.compileInHost(this._getBinding(typeOrBinding)).then((function(hostProtoViewRef) {
            var hostViewRef = $__0._viewManager.createFreeHostView(parentComponentLocation, hostProtoViewRef, injector);
            var newLocation = new ElementRef(hostViewRef, 0);
            var component = $__0._viewManager.getComponent(newLocation);
            var dispose = (function() {
              $__0._viewManager.destroyFreeHostView(parentComponentLocation, hostViewRef);
            });
            return new ComponentRef(newLocation, component, dispose);
          }));
        },
        loadNextToExistingLocation: function(typeOrBinding, location) {
          var injector = arguments[2] !== (void 0) ? arguments[2] : null;
          var $__0 = this;
          var binding = this._getBinding(typeOrBinding);
          return this._compiler.compileInHost(binding).then((function(hostProtoViewRef) {
            var viewContainer = $__0._viewManager.getViewContainer(location);
            var hostViewRef = viewContainer.create(hostProtoViewRef, viewContainer.length, null, injector);
            var newLocation = new ElementRef(hostViewRef, 0);
            var component = $__0._viewManager.getComponent(newLocation);
            var dispose = (function() {
              var index = viewContainer.indexOf(hostViewRef);
              viewContainer.remove(index);
            });
            return new ComponentRef(newLocation, component, dispose);
          }));
        },
        _getBinding: function(typeOrBinding) {
          var binding;
          if (typeOrBinding instanceof Binding) {
            binding = typeOrBinding;
          } else {
            binding = bind(typeOrBinding).toClass(typeOrBinding);
          }
          return binding;
        }
      }, {}));
      $__export("DynamicComponentLoader", DynamicComponentLoader);
      $__export("DynamicComponentLoader", DynamicComponentLoader = __decorate([Injectable(), __metadata('design:paramtypes', [Compiler, AppViewManager])], DynamicComponentLoader));
    }
  };
});

System.register("angular2/src/core/testability/get_testability", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/testability/get_testability";
  var global,
      PublicTestability,
      GetTestability;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {
      PublicTestability = (function() {
        function PublicTestability(testability) {
          this._testability = testability;
        }
        return ($traceurRuntime.createClass)(PublicTestability, {
          whenStable: function(callback) {
            this._testability.whenStable(callback);
          },
          findBindings: function(using, binding, exactMatch) {
            return this._testability.findBindings(using, binding, exactMatch);
          }
        }, {});
      }());
      GetTestability = (function() {
        function GetTestability() {}
        return ($traceurRuntime.createClass)(GetTestability, {}, {addToWindow: function(registry) {
            global.getAngularTestability = function(elem) {
              var testability = registry.findTestabilityInTree(elem);
              if (testability == null) {
                throw new Error('Could not find testability for element.');
              }
              return new PublicTestability(testability);
            };
          }});
      }());
      $__export("GetTestability", GetTestability);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/content_tag", ["angular2/src/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/content_tag";
  var DOM,
      isPresent,
      ListWrapper,
      ContentStrategy,
      RenderedContent,
      IntermediateContent,
      Content;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      ContentStrategy = (function() {
        function ContentStrategy() {}
        return ($traceurRuntime.createClass)(ContentStrategy, {insert: function(nodes) {}}, {});
      }());
      RenderedContent = (function($__super) {
        function RenderedContent(contentEl) {
          $traceurRuntime.superConstructor(RenderedContent).call(this);
          this.beginScript = contentEl;
          this.endScript = DOM.nextSibling(this.beginScript);
          this.nodes = [];
        }
        return ($traceurRuntime.createClass)(RenderedContent, {
          insert: function(nodes) {
            this.nodes = nodes;
            DOM.insertAllBefore(this.endScript, nodes);
            this._removeNodesUntil(ListWrapper.isEmpty(nodes) ? this.endScript : nodes[0]);
          },
          _removeNodesUntil: function(node) {
            var p = DOM.parentElement(this.beginScript);
            for (var next = DOM.nextSibling(this.beginScript); next !== node; next = DOM.nextSibling(this.beginScript)) {
              DOM.removeChild(p, next);
            }
          }
        }, {}, $__super);
      }(ContentStrategy));
      IntermediateContent = (function($__super) {
        function IntermediateContent(destinationLightDom) {
          $traceurRuntime.superConstructor(IntermediateContent).call(this);
          this.nodes = [];
          this.destinationLightDom = destinationLightDom;
        }
        return ($traceurRuntime.createClass)(IntermediateContent, {insert: function(nodes) {
            this.nodes = nodes;
            this.destinationLightDom.redistribute();
          }}, {}, $__super);
      }(ContentStrategy));
      Content = (function() {
        function Content(contentStartEl, selector) {
          this.select = selector;
          this.contentStartElement = contentStartEl;
          this._strategy = null;
        }
        return ($traceurRuntime.createClass)(Content, {
          init: function(destinationLightDom) {
            this._strategy = isPresent(destinationLightDom) ? new IntermediateContent(destinationLightDom) : new RenderedContent(this.contentStartElement);
          },
          nodes: function() {
            return this._strategy.nodes;
          },
          insert: function(nodes) {
            this._strategy.insert(nodes);
          }
        }, {});
      }());
      $__export("Content", Content);
    }
  };
});

System.register("angular2/src/render/dom/util", ["angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/util";
  var StringWrapper,
      RegExpWrapper,
      NG_BINDING_CLASS_SELECTOR,
      NG_BINDING_CLASS,
      EVENT_TARGET_SEPARATOR,
      CAMEL_CASE_REGEXP,
      DASH_CASE_REGEXP;
  function camelCaseToDashCase(input) {
    return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (function(m) {
      return '-' + m[1].toLowerCase();
    }));
  }
  function dashCaseToCamelCase(input) {
    return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (function(m) {
      return m[1].toUpperCase();
    }));
  }
  $__export("camelCaseToDashCase", camelCaseToDashCase);
  $__export("dashCaseToCamelCase", dashCaseToCamelCase);
  return {
    setters: [function($__m) {
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
    }],
    execute: function() {
      NG_BINDING_CLASS_SELECTOR = '.ng-binding';
      $__export("NG_BINDING_CLASS_SELECTOR", NG_BINDING_CLASS_SELECTOR);
      NG_BINDING_CLASS = 'ng-binding';
      $__export("NG_BINDING_CLASS", NG_BINDING_CLASS);
      EVENT_TARGET_SEPARATOR = ':';
      $__export("EVENT_TARGET_SEPARATOR", EVENT_TARGET_SEPARATOR);
      CAMEL_CASE_REGEXP = RegExpWrapper.create('([A-Z])');
      DASH_CASE_REGEXP = RegExpWrapper.create('-([a-z])');
    }
  };
});

System.register("angular2/src/render/dom/view/view_container", ["angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/view_container";
  var ListWrapper,
      DomViewContainer;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      DomViewContainer = (function() {
        function DomViewContainer() {
          this.views = [];
        }
        return ($traceurRuntime.createClass)(DomViewContainer, {
          contentTagContainers: function() {
            return this.views;
          },
          nodes: function() {
            var r = [];
            for (var i = 0; i < this.views.length; ++i) {
              r = ListWrapper.concat(r, this.views[i].rootNodes);
            }
            return r;
          }
        }, {});
      }());
      $__export("DomViewContainer", DomViewContainer);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_element", ["angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_element";
  var ListWrapper,
      MapWrapper,
      DOM,
      isBlank,
      isPresent,
      StringJoiner,
      assertionsEnabled,
      CompileElement;
  function getElementDescription(domElement) {
    var buf = new StringJoiner();
    var atts = DOM.attributeMap(domElement);
    buf.add("<");
    buf.add(DOM.tagName(domElement).toLowerCase());
    addDescriptionAttribute(buf, "id", MapWrapper.get(atts, "id"));
    addDescriptionAttribute(buf, "class", MapWrapper.get(atts, "class"));
    MapWrapper.forEach(atts, (function(attValue, attName) {
      if (attName !== "id" && attName !== "class") {
        addDescriptionAttribute(buf, attName, attValue);
      }
    }));
    buf.add(">");
    return buf.toString();
  }
  function addDescriptionAttribute(buffer, attName, attValue) {
    if (isPresent(attValue)) {
      if (attValue.length === 0) {
        buffer.add(' ' + attName);
      } else {
        buffer.add(' ' + attName + '="' + attValue + '"');
      }
    }
  }
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      StringJoiner = $__m.StringJoiner;
      assertionsEnabled = $__m.assertionsEnabled;
    }],
    execute: function() {
      CompileElement = (function() {
        function CompileElement(element) {
          var compilationUnit = arguments[1] !== (void 0) ? arguments[1] : '';
          this.element = element;
          this._attrs = null;
          this._classList = null;
          this.isViewRoot = false;
          this.inheritedProtoView = null;
          this.inheritedElementBinder = null;
          this.distanceToInheritedBinder = 0;
          this.compileChildren = true;
          var tplDesc = assertionsEnabled() ? getElementDescription(element) : null;
          if (compilationUnit !== '') {
            this.elementDescription = compilationUnit;
            if (isPresent(tplDesc))
              this.elementDescription += ": " + tplDesc;
          } else {
            this.elementDescription = tplDesc;
          }
        }
        return ($traceurRuntime.createClass)(CompileElement, {
          isBound: function() {
            return isPresent(this.inheritedElementBinder) && this.distanceToInheritedBinder === 0;
          },
          bindElement: function() {
            if (!this.isBound()) {
              var parentBinder = this.inheritedElementBinder;
              this.inheritedElementBinder = this.inheritedProtoView.bindElement(this.element, this.elementDescription);
              if (isPresent(parentBinder)) {
                this.inheritedElementBinder.setParent(parentBinder, this.distanceToInheritedBinder);
              }
              this.distanceToInheritedBinder = 0;
            }
            return this.inheritedElementBinder;
          },
          refreshAttrs: function() {
            this._attrs = null;
          },
          attrs: function() {
            if (isBlank(this._attrs)) {
              this._attrs = DOM.attributeMap(this.element);
            }
            return this._attrs;
          },
          refreshClassList: function() {
            this._classList = null;
          },
          classList: function() {
            if (isBlank(this._classList)) {
              this._classList = ListWrapper.create();
              var elClassList = DOM.classList(this.element);
              for (var i = 0; i < elClassList.length; i++) {
                ListWrapper.push(this._classList, elClassList[i]);
              }
            }
            return this._classList;
          }
        }, {});
      }());
      $__export("CompileElement", CompileElement);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_control", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_control";
  var isBlank,
      ListWrapper,
      CompileControl;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      CompileControl = (function() {
        function CompileControl(steps) {
          this._steps = steps;
          this._currentStepIndex = 0;
          this._parent = null;
          this._results = null;
          this._additionalChildren = null;
        }
        return ($traceurRuntime.createClass)(CompileControl, {
          internalProcess: function(results, startStepIndex, parent, current) {
            this._results = results;
            var previousStepIndex = this._currentStepIndex;
            var previousParent = this._parent;
            this._ignoreCurrentElement = false;
            for (var i = startStepIndex; i < this._steps.length && !this._ignoreCurrentElement; i++) {
              var step = this._steps[i];
              this._parent = parent;
              this._currentStepIndex = i;
              step.process(parent, current, this);
              parent = this._parent;
            }
            if (!this._ignoreCurrentElement) {
              ListWrapper.push(results, current);
            }
            this._currentStepIndex = previousStepIndex;
            this._parent = previousParent;
            var localAdditionalChildren = this._additionalChildren;
            this._additionalChildren = null;
            return localAdditionalChildren;
          },
          addParent: function(newElement) {
            this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
            this._parent = newElement;
          },
          addChild: function(element) {
            if (isBlank(this._additionalChildren)) {
              this._additionalChildren = ListWrapper.create();
            }
            ListWrapper.push(this._additionalChildren, element);
          },
          ignoreCurrentElement: function() {
            this._ignoreCurrentElement = true;
          }
        }, {});
      }());
      $__export("CompileControl", CompileControl);
    }
  };
});

System.register("angular2/src/render/dom/view/element_binder", [], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/element_binder";
  var ElementBinder,
      Event,
      HostAction;
  return {
    setters: [],
    execute: function() {
      ElementBinder = (function() {
        function ElementBinder() {
          var $__1 = arguments[0] !== (void 0) ? arguments[0] : {},
              textNodeIndices = $__1.textNodeIndices,
              contentTagSelector = $__1.contentTagSelector,
              nestedProtoView = $__1.nestedProtoView,
              componentId = $__1.componentId,
              eventLocals = $__1.eventLocals,
              localEvents = $__1.localEvents,
              globalEvents = $__1.globalEvents,
              hostActions = $__1.hostActions,
              parentIndex = $__1.parentIndex,
              distanceToParent = $__1.distanceToParent,
              propertySetters = $__1.propertySetters;
          this.textNodeIndices = textNodeIndices;
          this.contentTagSelector = contentTagSelector;
          this.nestedProtoView = nestedProtoView;
          this.componentId = componentId;
          this.eventLocals = eventLocals;
          this.localEvents = localEvents;
          this.globalEvents = globalEvents;
          this.hostActions = hostActions;
          this.parentIndex = parentIndex;
          this.distanceToParent = distanceToParent;
          this.propertySetters = propertySetters;
        }
        return ($traceurRuntime.createClass)(ElementBinder, {}, {});
      }());
      $__export("ElementBinder", ElementBinder);
      Event = (function() {
        function Event(name, target, fullName) {
          this.name = name;
          this.target = target;
          this.fullName = fullName;
        }
        return ($traceurRuntime.createClass)(Event, {}, {});
      }());
      $__export("Event", Event);
      HostAction = (function() {
        function HostAction(actionName, actionExpression, expression) {
          this.actionName = actionName;
          this.actionExpression = actionExpression;
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(HostAction, {}, {});
      }());
      $__export("HostAction", HostAction);
    }
  };
});

System.register("angular2/src/render/dom/view/property_setter_factory", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/util", "angular2/src/reflection/reflection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/property_setter_factory";
  var StringWrapper,
      BaseException,
      isPresent,
      isBlank,
      isString,
      stringify,
      ListWrapper,
      StringMapWrapper,
      DOM,
      camelCaseToDashCase,
      reflector,
      STYLE_SEPARATOR,
      propertySettersCache,
      innerHTMLSetterCache,
      ATTRIBUTE_PREFIX,
      attributeSettersCache,
      CLASS_PREFIX,
      classSettersCache,
      STYLE_PREFIX,
      styleSettersCache;
  function setterFactory(property) {
    var setterFn,
        styleParts,
        styleSuffix;
    if (StringWrapper.startsWith(property, ATTRIBUTE_PREFIX)) {
      setterFn = attributeSetterFactory(StringWrapper.substring(property, ATTRIBUTE_PREFIX.length));
    } else if (StringWrapper.startsWith(property, CLASS_PREFIX)) {
      setterFn = classSetterFactory(StringWrapper.substring(property, CLASS_PREFIX.length));
    } else if (StringWrapper.startsWith(property, STYLE_PREFIX)) {
      styleParts = property.split(STYLE_SEPARATOR);
      styleSuffix = styleParts.length > 2 ? ListWrapper.get(styleParts, 2) : '';
      setterFn = styleSetterFactory(ListWrapper.get(styleParts, 1), styleSuffix);
    } else if (StringWrapper.equals(property, 'innerHtml')) {
      if (isBlank(innerHTMLSetterCache)) {
        innerHTMLSetterCache = (function(el, value) {
          return DOM.setInnerHTML(el, value);
        });
      }
      setterFn = innerHTMLSetterCache;
    } else {
      property = resolvePropertyName(property);
      setterFn = StringMapWrapper.get(propertySettersCache, property);
      if (isBlank(setterFn)) {
        var propertySetterFn = reflector.setter(property);
        setterFn = function(receiver, value) {
          if (DOM.hasProperty(receiver, property)) {
            return propertySetterFn(receiver, value);
          }
        };
        StringMapWrapper.set(propertySettersCache, property, setterFn);
      }
    }
    return setterFn;
  }
  function _isValidAttributeValue(attrName, value) {
    if (attrName == "role") {
      return isString(value);
    } else {
      return isPresent(value);
    }
  }
  function attributeSetterFactory(attrName) {
    var setterFn = StringMapWrapper.get(attributeSettersCache, attrName);
    var dashCasedAttributeName;
    if (isBlank(setterFn)) {
      dashCasedAttributeName = camelCaseToDashCase(attrName);
      setterFn = function(element, value) {
        if (_isValidAttributeValue(dashCasedAttributeName, value)) {
          DOM.setAttribute(element, dashCasedAttributeName, stringify(value));
        } else {
          if (isPresent(value)) {
            throw new BaseException("Invalid " + dashCasedAttributeName + " attribute, only string values are allowed, got '" + stringify(value) + "'");
          }
          DOM.removeAttribute(element, dashCasedAttributeName);
        }
      };
      StringMapWrapper.set(attributeSettersCache, attrName, setterFn);
    }
    return setterFn;
  }
  function classSetterFactory(className) {
    var setterFn = StringMapWrapper.get(classSettersCache, className);
    var dashCasedClassName;
    if (isBlank(setterFn)) {
      dashCasedClassName = camelCaseToDashCase(className);
      setterFn = function(element, value) {
        if (value) {
          DOM.addClass(element, dashCasedClassName);
        } else {
          DOM.removeClass(element, dashCasedClassName);
        }
      };
      StringMapWrapper.set(classSettersCache, className, setterFn);
    }
    return setterFn;
  }
  function styleSetterFactory(styleName, styleSuffix) {
    var cacheKey = styleName + styleSuffix;
    var setterFn = StringMapWrapper.get(styleSettersCache, cacheKey);
    var dashCasedStyleName;
    if (isBlank(setterFn)) {
      dashCasedStyleName = camelCaseToDashCase(styleName);
      setterFn = function(element, value) {
        var valAsStr;
        if (isPresent(value)) {
          valAsStr = stringify(value);
          DOM.setStyle(element, dashCasedStyleName, valAsStr + styleSuffix);
        } else {
          DOM.removeStyle(element, dashCasedStyleName);
        }
      };
      StringMapWrapper.set(styleSettersCache, cacheKey, setterFn);
    }
    return setterFn;
  }
  function resolvePropertyName(attrName) {
    var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, attrName);
    return isPresent(mappedPropName) ? mappedPropName : attrName;
  }
  $__export("setterFactory", setterFactory);
  return {
    setters: [function($__m) {
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      isString = $__m.isString;
      stringify = $__m.stringify;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      camelCaseToDashCase = $__m.camelCaseToDashCase;
    }, function($__m) {
      reflector = $__m.reflector;
    }],
    execute: function() {
      STYLE_SEPARATOR = '.';
      propertySettersCache = StringMapWrapper.create();
      ATTRIBUTE_PREFIX = 'attr.';
      attributeSettersCache = StringMapWrapper.create();
      CLASS_PREFIX = 'class.';
      classSettersCache = StringMapWrapper.create();
      STYLE_PREFIX = 'style.';
      styleSettersCache = StringMapWrapper.create();
    }
  };
});

System.register("angular2/src/render/dom/compiler/property_binding_parser", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/property_binding_parser";
  var isPresent,
      RegExpWrapper,
      MapWrapper,
      dashCaseToCamelCase,
      BIND_NAME_REGEXP,
      PropertyBindingParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
    }],
    execute: function() {
      BIND_NAME_REGEXP = RegExpWrapper.create('^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\\[\\(([^\\)]+)\\)\\]|\\[([^\\]]+)\\]|\\(([^\\)]+)\\))$');
      PropertyBindingParser = (function() {
        function PropertyBindingParser(parser) {
          this._parser = parser;
        }
        return ($traceurRuntime.createClass)(PropertyBindingParser, {
          process: function(parent, current, control) {
            var $__0 = this;
            var attrs = current.attrs();
            var newAttrs = MapWrapper.create();
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
              if (isPresent(bindParts)) {
                if (isPresent(bindParts[1])) {
                  $__0._bindProperty(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[2])) {
                  var identifier = bindParts[5];
                  var value = attrValue == '' ? '\$implicit' : attrValue;
                  $__0._bindVariable(identifier, value, current, newAttrs);
                } else if (isPresent(bindParts[3])) {
                  $__0._bindEvent(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[4])) {
                  $__0._bindProperty(bindParts[5], attrValue, current, newAttrs);
                  $__0._bindAssignmentEvent(bindParts[5], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[6])) {
                  $__0._bindProperty(bindParts[6], attrValue, current, newAttrs);
                  $__0._bindAssignmentEvent(bindParts[6], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[7])) {
                  $__0._bindProperty(bindParts[7], attrValue, current, newAttrs);
                } else if (isPresent(bindParts[8])) {
                  $__0._bindEvent(bindParts[8], attrValue, current, newAttrs);
                }
              } else {
                var expr = $__0._parser.parseInterpolation(attrValue, current.elementDescription);
                if (isPresent(expr)) {
                  $__0._bindPropertyAst(attrName, expr, current, newAttrs);
                }
              }
            }));
            MapWrapper.forEach(newAttrs, (function(attrValue, attrName) {
              MapWrapper.set(attrs, attrName, attrValue);
            }));
          },
          _bindVariable: function(identifier, value, current, newAttrs) {
            current.bindElement().bindVariable(dashCaseToCamelCase(identifier), value);
            MapWrapper.set(newAttrs, identifier, value);
          },
          _bindProperty: function(name, expression, current, newAttrs) {
            this._bindPropertyAst(name, this._parser.parseBinding(expression, current.elementDescription), current, newAttrs);
          },
          _bindPropertyAst: function(name, ast, current, newAttrs) {
            var binder = current.bindElement();
            var camelCaseName = dashCaseToCamelCase(name);
            binder.bindProperty(camelCaseName, ast);
            MapWrapper.set(newAttrs, name, ast.source);
          },
          _bindAssignmentEvent: function(name, expression, current, newAttrs) {
            this._bindEvent(name, (expression + "=$event"), current, newAttrs);
          },
          _bindEvent: function(name, expression, current, newAttrs) {
            current.bindElement().bindEvent(dashCaseToCamelCase(name), this._parser.parseAction(expression, current.elementDescription));
          }
        }, {});
      }());
      $__export("PropertyBindingParser", PropertyBindingParser);
    }
  };
});

System.register("angular2/src/render/dom/compiler/text_interpolation_parser", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/text_interpolation_parser";
  var isPresent,
      DOM,
      TextInterpolationParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      TextInterpolationParser = (function() {
        function TextInterpolationParser(parser) {
          this._parser = parser;
        }
        return ($traceurRuntime.createClass)(TextInterpolationParser, {process: function(parent, current, control) {
            if (!current.compileChildren) {
              return ;
            }
            var element = current.element;
            var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
            for (var i = 0; i < childNodes.length; i++) {
              var node = childNodes[i];
              if (DOM.isTextNode(node)) {
                var text = DOM.nodeValue(node);
                var expr = this._parser.parseInterpolation(text, current.elementDescription);
                if (isPresent(expr)) {
                  DOM.setText(node, ' ');
                  current.bindElement().bindText(i, expr);
                }
              }
            }
          }}, {});
      }());
      $__export("TextInterpolationParser", TextInterpolationParser);
    }
  };
});

System.register("angular2/src/render/dom/compiler/selector", ["angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/selector";
  var ListWrapper,
      MapWrapper,
      isPresent,
      isBlank,
      RegExpWrapper,
      RegExpMatcherWrapper,
      StringWrapper,
      BaseException,
      _EMPTY_ATTR_VALUE,
      _SELECTOR_REGEXP,
      CssSelector,
      SelectorMatcher,
      SelectorListContext,
      SelectorContext;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      RegExpWrapper = $__m.RegExpWrapper;
      RegExpMatcherWrapper = $__m.RegExpMatcherWrapper;
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      _EMPTY_ATTR_VALUE = '';
      _SELECTOR_REGEXP = RegExpWrapper.create('(\\:not\\()|' + '([-\\w]+)|' + '(?:\\.([-\\w]+))|' + '(?:\\[([-\\w*]+)(?:=([^\\]]*))?\\])|' + '(?:\\))|' + '(\\s*,\\s*)');
      CssSelector = (function() {
        function CssSelector() {
          this.element = null;
          this.classNames = ListWrapper.create();
          this.attrs = ListWrapper.create();
          this.notSelector = null;
        }
        return ($traceurRuntime.createClass)(CssSelector, {
          isElementSelector: function() {
            return isPresent(this.element) && ListWrapper.isEmpty(this.classNames) && ListWrapper.isEmpty(this.attrs) && isBlank(this.notSelector);
          },
          setElement: function() {
            var element = arguments[0] !== (void 0) ? arguments[0] : null;
            if (isPresent(element)) {
              element = element.toLowerCase();
            }
            this.element = element;
          },
          addAttribute: function(name) {
            var value = arguments[1] !== (void 0) ? arguments[1] : _EMPTY_ATTR_VALUE;
            ListWrapper.push(this.attrs, name.toLowerCase());
            if (isPresent(value)) {
              value = value.toLowerCase();
            } else {
              value = _EMPTY_ATTR_VALUE;
            }
            ListWrapper.push(this.attrs, value);
          },
          addClassName: function(name) {
            ListWrapper.push(this.classNames, name.toLowerCase());
          },
          toString: function() {
            var res = '';
            if (isPresent(this.element)) {
              res += this.element;
            }
            if (isPresent(this.classNames)) {
              for (var i = 0; i < this.classNames.length; i++) {
                res += '.' + this.classNames[i];
              }
            }
            if (isPresent(this.attrs)) {
              for (var i = 0; i < this.attrs.length; ) {
                var attrName = this.attrs[i++];
                var attrValue = this.attrs[i++];
                res += '[' + attrName;
                if (attrValue.length > 0) {
                  res += '=' + attrValue;
                }
                res += ']';
              }
            }
            if (isPresent(this.notSelector)) {
              res += ":not(" + this.notSelector.toString() + ")";
            }
            return res;
          }
        }, {parse: function(selector) {
            var results = ListWrapper.create();
            var _addResult = (function(res, cssSel) {
              if (isPresent(cssSel.notSelector) && isBlank(cssSel.element) && ListWrapper.isEmpty(cssSel.classNames) && ListWrapper.isEmpty(cssSel.attrs)) {
                cssSel.element = "*";
              }
              ListWrapper.push(res, cssSel);
            });
            var cssSelector = new CssSelector();
            var matcher = RegExpWrapper.matcher(_SELECTOR_REGEXP, selector);
            var match;
            var current = cssSelector;
            while (isPresent(match = RegExpMatcherWrapper.next(matcher))) {
              if (isPresent(match[1])) {
                if (isPresent(cssSelector.notSelector)) {
                  throw new BaseException('Nesting :not is not allowed in a selector');
                }
                current.notSelector = new CssSelector();
                current = current.notSelector;
              }
              if (isPresent(match[2])) {
                current.setElement(match[2]);
              }
              if (isPresent(match[3])) {
                current.addClassName(match[3]);
              }
              if (isPresent(match[4])) {
                current.addAttribute(match[4], match[5]);
              }
              if (isPresent(match[6])) {
                _addResult(results, cssSelector);
                cssSelector = current = new CssSelector();
              }
            }
            _addResult(results, cssSelector);
            return results;
          }});
      }());
      $__export("CssSelector", CssSelector);
      SelectorMatcher = (function() {
        function SelectorMatcher() {
          this._elementMap = MapWrapper.create();
          this._elementPartialMap = MapWrapper.create();
          this._classMap = MapWrapper.create();
          this._classPartialMap = MapWrapper.create();
          this._attrValueMap = MapWrapper.create();
          this._attrValuePartialMap = MapWrapper.create();
          this._listContexts = ListWrapper.create();
        }
        return ($traceurRuntime.createClass)(SelectorMatcher, {
          addSelectables: function(cssSelectors, callbackCtxt) {
            var listContext = null;
            if (cssSelectors.length > 1) {
              listContext = new SelectorListContext(cssSelectors);
              ListWrapper.push(this._listContexts, listContext);
            }
            for (var i = 0; i < cssSelectors.length; i++) {
              this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
            }
          },
          _addSelectable: function(cssSelector, callbackCtxt, listContext) {
            var matcher = this;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
            if (isPresent(element)) {
              var isTerminal = attrs.length === 0 && classNames.length === 0;
              if (isTerminal) {
                this._addTerminal(matcher._elementMap, element, selectable);
              } else {
                matcher = this._addPartial(matcher._elementPartialMap, element);
              }
            }
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var isTerminal = attrs.length === 0 && index === classNames.length - 1;
                var className = classNames[index];
                if (isTerminal) {
                  this._addTerminal(matcher._classMap, className, selectable);
                } else {
                  matcher = this._addPartial(matcher._classPartialMap, className);
                }
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var isTerminal = index === attrs.length - 2;
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                if (isTerminal) {
                  var terminalMap = matcher._attrValueMap;
                  var terminalValuesMap = MapWrapper.get(terminalMap, attrName);
                  if (isBlank(terminalValuesMap)) {
                    terminalValuesMap = MapWrapper.create();
                    MapWrapper.set(terminalMap, attrName, terminalValuesMap);
                  }
                  this._addTerminal(terminalValuesMap, attrValue, selectable);
                } else {
                  var parttialMap = matcher._attrValuePartialMap;
                  var partialValuesMap = MapWrapper.get(parttialMap, attrName);
                  if (isBlank(partialValuesMap)) {
                    partialValuesMap = MapWrapper.create();
                    MapWrapper.set(parttialMap, attrName, partialValuesMap);
                  }
                  matcher = this._addPartial(partialValuesMap, attrValue);
                }
              }
            }
          },
          _addTerminal: function(map, name, selectable) {
            var terminalList = MapWrapper.get(map, name);
            if (isBlank(terminalList)) {
              terminalList = ListWrapper.create();
              MapWrapper.set(map, name, terminalList);
            }
            ListWrapper.push(terminalList, selectable);
          },
          _addPartial: function(map, name) {
            var matcher = MapWrapper.get(map, name);
            if (isBlank(matcher)) {
              matcher = new SelectorMatcher();
              MapWrapper.set(map, name, matcher);
            }
            return matcher;
          },
          match: function(cssSelector, matchedCallback) {
            var result = false;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            for (var i = 0; i < this._listContexts.length; i++) {
              this._listContexts[i].alreadyMatched = false;
            }
            result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
            result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) || result;
            if (isPresent(classNames)) {
              for (var index = 0; index < classNames.length; index++) {
                var className = classNames[index];
                result = this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                result = this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) || result;
              }
            }
            if (isPresent(attrs)) {
              for (var index = 0; index < attrs.length; ) {
                var attrName = attrs[index++];
                var attrValue = attrs[index++];
                var terminalValuesMap = MapWrapper.get(this._attrValueMap, attrName);
                if (!StringWrapper.equals(attrValue, _EMPTY_ATTR_VALUE)) {
                  result = this._matchTerminal(terminalValuesMap, _EMPTY_ATTR_VALUE, cssSelector, matchedCallback) || result;
                }
                result = this._matchTerminal(terminalValuesMap, attrValue, cssSelector, matchedCallback) || result;
                var partialValuesMap = MapWrapper.get(this._attrValuePartialMap, attrName);
                result = this._matchPartial(partialValuesMap, attrValue, cssSelector, matchedCallback) || result;
              }
            }
            return result;
          },
          _matchTerminal: function(map, name, cssSelector, matchedCallback) {
            if (isBlank(map) || isBlank(name)) {
              return false;
            }
            var selectables = MapWrapper.get(map, name);
            var starSelectables = MapWrapper.get(map, "*");
            if (isPresent(starSelectables)) {
              selectables = ListWrapper.concat(selectables, starSelectables);
            }
            if (isBlank(selectables)) {
              return false;
            }
            var selectable;
            var result = false;
            for (var index = 0; index < selectables.length; index++) {
              selectable = selectables[index];
              result = selectable.finalize(cssSelector, matchedCallback) || result;
            }
            return result;
          },
          _matchPartial: function(map, name, cssSelector, matchedCallback) {
            if (isBlank(map) || isBlank(name)) {
              return false;
            }
            var nestedSelector = MapWrapper.get(map, name);
            if (isBlank(nestedSelector)) {
              return false;
            }
            return nestedSelector.match(cssSelector, matchedCallback);
          }
        }, {createNotMatcher: function(notSelector) {
            var notMatcher = new SelectorMatcher();
            notMatcher._addSelectable(notSelector, null, null);
            return notMatcher;
          }});
      }());
      $__export("SelectorMatcher", SelectorMatcher);
      SelectorListContext = (function() {
        function SelectorListContext(selectors) {
          this.selectors = selectors;
          this.alreadyMatched = false;
        }
        return ($traceurRuntime.createClass)(SelectorListContext, {}, {});
      }());
      SelectorContext = (function() {
        function SelectorContext(selector, cbContext, listContext) {
          this.selector = selector;
          this.notSelector = selector.notSelector;
          this.cbContext = cbContext;
          this.listContext = listContext;
        }
        return ($traceurRuntime.createClass)(SelectorContext, {finalize: function(cssSelector, callback) {
            var result = true;
            if (isPresent(this.notSelector) && (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
              var notMatcher = SelectorMatcher.createNotMatcher(this.notSelector);
              result = !notMatcher.match(cssSelector, null);
            }
            if (result && isPresent(callback) && (isBlank(this.listContext) || !this.listContext.alreadyMatched)) {
              if (isPresent(this.listContext)) {
                this.listContext.alreadyMatched = true;
              }
              callback(this.selector, this.cbContext);
            }
            return result;
          }}, {});
      }());
    }
  };
});

System.register("angular2/src/render/dom/compiler/view_splitter", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/render/dom/compiler/compile_element", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/view_splitter";
  var isPresent,
      BaseException,
      StringWrapper,
      DOM,
      MapWrapper,
      CompileElement,
      dashCaseToCamelCase,
      ViewSplitter;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      CompileElement = $__m.CompileElement;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
    }],
    execute: function() {
      ViewSplitter = (function() {
        function ViewSplitter(parser) {
          this._parser = parser;
        }
        return ($traceurRuntime.createClass)(ViewSplitter, {
          process: function(parent, current, control) {
            var attrs = current.attrs();
            var templateBindings = MapWrapper.get(attrs, 'template');
            var hasTemplateBinding = isPresent(templateBindings);
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              if (StringWrapper.startsWith(attrName, '*')) {
                var key = StringWrapper.substring(attrName, 1);
                if (hasTemplateBinding) {
                  throw new BaseException("Only one template directive per element is allowed: " + (templateBindings + " and " + key + " cannot be used simultaneously ") + ("in " + current.elementDescription));
                } else {
                  templateBindings = (attrValue.length == 0) ? key : key + ' ' + attrValue;
                  hasTemplateBinding = true;
                }
              }
            }));
            if (isPresent(parent)) {
              if (DOM.isTemplateElement(current.element)) {
                if (!current.isViewRoot) {
                  var viewRoot = new CompileElement(DOM.createTemplate(''));
                  viewRoot.inheritedProtoView = current.bindElement().bindNestedProtoView(viewRoot.element);
                  viewRoot.elementDescription = current.elementDescription;
                  viewRoot.isViewRoot = true;
                  this._moveChildNodes(DOM.content(current.element), DOM.content(viewRoot.element));
                  control.addChild(viewRoot);
                }
              }
              if (hasTemplateBinding) {
                var newParent = new CompileElement(DOM.createTemplate(''));
                newParent.inheritedProtoView = current.inheritedProtoView;
                newParent.inheritedElementBinder = current.inheritedElementBinder;
                newParent.distanceToInheritedBinder = current.distanceToInheritedBinder;
                newParent.elementDescription = current.elementDescription;
                current.inheritedProtoView = newParent.bindElement().bindNestedProtoView(current.element);
                current.inheritedElementBinder = null;
                current.distanceToInheritedBinder = 0;
                current.isViewRoot = true;
                this._parseTemplateBindings(templateBindings, newParent);
                this._addParentElement(current.element, newParent.element);
                control.addParent(newParent);
                DOM.remove(current.element);
              }
            }
          },
          _moveChildNodes: function(source, target) {
            var next = DOM.firstChild(source);
            while (isPresent(next)) {
              DOM.appendChild(target, next);
              next = DOM.firstChild(source);
            }
          },
          _addParentElement: function(currentElement, newParentElement) {
            DOM.insertBefore(currentElement, newParentElement);
            DOM.appendChild(newParentElement, currentElement);
          },
          _parseTemplateBindings: function(templateBindings, compileElement) {
            var bindings = this._parser.parseTemplateBindings(templateBindings, compileElement.elementDescription);
            for (var i = 0; i < bindings.length; i++) {
              var binding = bindings[i];
              if (binding.keyIsVar) {
                compileElement.bindElement().bindVariable(dashCaseToCamelCase(binding.key), binding.name);
                MapWrapper.set(compileElement.attrs(), binding.key, binding.name);
              } else if (isPresent(binding.expression)) {
                compileElement.bindElement().bindProperty(dashCaseToCamelCase(binding.key), binding.expression);
                MapWrapper.set(compileElement.attrs(), binding.key, binding.expression.source);
              } else {
                DOM.setAttribute(compileElement.element, binding.key, '');
              }
            }
          }
        }, {});
      }());
      $__export("ViewSplitter", ViewSplitter);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/shadow_dom_compile_step", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/shadow_dom_compile_step";
  var isPresent,
      assertionsEnabled,
      MapWrapper,
      ListWrapper,
      PromiseWrapper,
      DOM,
      ShadowDomCompileStep;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      assertionsEnabled = $__m.assertionsEnabled;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      ShadowDomCompileStep = (function() {
        function ShadowDomCompileStep(shadowDomStrategy, template, subTaskPromises) {
          this._shadowDomStrategy = shadowDomStrategy;
          this._template = template;
          this._subTaskPromises = subTaskPromises;
        }
        return ($traceurRuntime.createClass)(ShadowDomCompileStep, {
          process: function(parent, current, control) {
            var tagName = DOM.tagName(current.element).toUpperCase();
            if (tagName == 'STYLE') {
              this._processStyleElement(current, control);
            } else if (tagName == 'CONTENT') {
              this._processContentElement(current);
            } else {
              var componentId = current.isBound() ? current.inheritedElementBinder.componentId : null;
              this._shadowDomStrategy.processElement(this._template.componentId, componentId, current.element);
            }
          },
          _processStyleElement: function(current, control) {
            var stylePromise = this._shadowDomStrategy.processStyleElement(this._template.componentId, this._template.absUrl, current.element);
            if (isPresent(stylePromise) && PromiseWrapper.isPromise(stylePromise)) {
              ListWrapper.push(this._subTaskPromises, stylePromise);
            }
            control.ignoreCurrentElement();
          },
          _processContentElement: function(current) {
            if (this._shadowDomStrategy.hasNativeContentElement()) {
              return ;
            }
            var attrs = current.attrs();
            var selector = MapWrapper.get(attrs, 'select');
            selector = isPresent(selector) ? selector : '';
            var contentStart = DOM.createScriptTag('type', 'ng/contentStart');
            if (assertionsEnabled()) {
              DOM.setAttribute(contentStart, 'select', selector);
            }
            var contentEnd = DOM.createScriptTag('type', 'ng/contentEnd');
            DOM.insertBefore(current.element, contentStart);
            DOM.insertBefore(current.element, contentEnd);
            DOM.remove(current.element);
            current.element = contentStart;
            current.bindElement().setContentTagSelector(selector);
          }
        }, {});
      }());
      $__export("ShadowDomCompileStep", ShadowDomCompileStep);
    }
  };
});

System.register("angular2/src/core/application_tokens", ["angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/application_tokens";
  var OpaqueToken,
      appComponentRefToken,
      appComponentTypeToken;
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }],
    execute: function() {
      appComponentRefToken = new OpaqueToken('ComponentRef');
      $__export("appComponentRefToken", appComponentRefToken);
      appComponentTypeToken = new OpaqueToken('RootComponent');
      $__export("appComponentTypeToken", appComponentTypeToken);
    }
  };
});

System.register("angular2/src/core/annotations/di", ["angular2/src/core/annotations_impl/di"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/di";
  return {
    setters: [function($__m) {
      $__export("QueryAnnotation", $__m.Query);
      $__export("AttributeAnnotation", $__m.Attribute);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy", ["angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy";
  var DOM,
      ShadowDomStrategy,
      NativeShadowDomStrategy;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }],
    execute: function() {
      NativeShadowDomStrategy = (function($__super) {
        function NativeShadowDomStrategy(styleUrlResolver) {
          $traceurRuntime.superConstructor(NativeShadowDomStrategy).call(this);
          this.styleUrlResolver = styleUrlResolver;
        }
        return ($traceurRuntime.createClass)(NativeShadowDomStrategy, {
          prepareShadowRoot: function(el) {
            return DOM.createShadowRoot(el);
          },
          processStyleElement: function(hostComponentId, templateUrl, styleEl) {
            var cssText = DOM.getText(styleEl);
            cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
            DOM.setText(styleEl, cssText);
            return null;
          }
        }, {}, $__super);
      }(ShadowDomStrategy));
      $__export("NativeShadowDomStrategy", NativeShadowDomStrategy);
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy";
  var isPresent,
      PromiseWrapper,
      DOM,
      EmulatedUnscopedShadowDomStrategy,
      getContentAttribute,
      getHostAttribute,
      getComponentId,
      shimCssForComponent,
      insertStyleElement,
      EmulatedScopedShadowDomStrategy;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      EmulatedUnscopedShadowDomStrategy = $__m.EmulatedUnscopedShadowDomStrategy;
    }, function($__m) {
      getContentAttribute = $__m.getContentAttribute;
      getHostAttribute = $__m.getHostAttribute;
      getComponentId = $__m.getComponentId;
      shimCssForComponent = $__m.shimCssForComponent;
      insertStyleElement = $__m.insertStyleElement;
    }],
    execute: function() {
      EmulatedScopedShadowDomStrategy = (function($__super) {
        function EmulatedScopedShadowDomStrategy(styleInliner, styleUrlResolver, styleHost) {
          $traceurRuntime.superConstructor(EmulatedScopedShadowDomStrategy).call(this, styleUrlResolver, styleHost);
          this.styleInliner = styleInliner;
        }
        return ($traceurRuntime.createClass)(EmulatedScopedShadowDomStrategy, {
          processStyleElement: function(hostComponentId, templateUrl, styleEl) {
            var cssText = DOM.getText(styleEl);
            cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
            var inlinedCss = this.styleInliner.inlineImports(cssText, templateUrl);
            if (PromiseWrapper.isPromise(inlinedCss)) {
              DOM.setText(styleEl, '');
              return inlinedCss.then((function(css) {
                css = shimCssForComponent(css, hostComponentId);
                DOM.setText(styleEl, css);
              }));
            } else {
              var css = shimCssForComponent(inlinedCss, hostComponentId);
              DOM.setText(styleEl, css);
              DOM.remove(styleEl);
              insertStyleElement(this.styleHost, styleEl);
              return null;
            }
          },
          processElement: function(hostComponentId, elementComponentId, element) {
            if (isPresent(hostComponentId)) {
              var contentAttribute = getContentAttribute(getComponentId(hostComponentId));
              DOM.setAttribute(element, contentAttribute, '');
            }
            if (isPresent(elementComponentId)) {
              var hostAttribute = getHostAttribute(getComponentId(elementComponentId));
              DOM.setAttribute(element, hostAttribute, '');
            }
          }
        }, {}, $__super);
      }(EmulatedUnscopedShadowDomStrategy));
      $__export("EmulatedScopedShadowDomStrategy", EmulatedScopedShadowDomStrategy);
    }
  };
});

System.register("angular2/src/core/annotations/annotations", ["angular2/src/core/annotations_impl/annotations"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/annotations";
  return {
    setters: [function($__m) {
      $__export("ComponentAnnotation", $__m.Component);
      $__export("DirectiveAnnotation", $__m.Directive);
      $__export("onDestroy", $__m.onDestroy);
      $__export("onChange", $__m.onChange);
      $__export("onAllChangesDone", $__m.onAllChangesDone);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/annotations/decorators", ["angular2/src/core/annotations/annotations", "angular2/src/core/annotations/view", "angular2/src/core/annotations/visibility", "angular2/src/core/annotations/di", "angular2/src/util/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/decorators";
  var ComponentAnnotation,
      DirectiveAnnotation,
      ViewAnnotation,
      SelfAnnotation,
      ParentAnnotation,
      AncestorAnnotation,
      UnboundedAnnotation,
      AttributeAnnotation,
      QueryAnnotation,
      makeDecorator,
      makeParamDecorator,
      Component,
      Directive,
      View,
      Self,
      Parent,
      Ancestor,
      Unbounded,
      Attribute,
      Query;
  return {
    setters: [function($__m) {
      ComponentAnnotation = $__m.ComponentAnnotation;
      DirectiveAnnotation = $__m.DirectiveAnnotation;
    }, function($__m) {
      ViewAnnotation = $__m.ViewAnnotation;
    }, function($__m) {
      SelfAnnotation = $__m.SelfAnnotation;
      ParentAnnotation = $__m.ParentAnnotation;
      AncestorAnnotation = $__m.AncestorAnnotation;
      UnboundedAnnotation = $__m.UnboundedAnnotation;
    }, function($__m) {
      AttributeAnnotation = $__m.AttributeAnnotation;
      QueryAnnotation = $__m.QueryAnnotation;
    }, function($__m) {
      makeDecorator = $__m.makeDecorator;
      makeParamDecorator = $__m.makeParamDecorator;
    }],
    execute: function() {
      Component = makeDecorator(ComponentAnnotation);
      $__export("Component", Component);
      Directive = makeDecorator(DirectiveAnnotation);
      $__export("Directive", Directive);
      View = makeDecorator(ViewAnnotation);
      $__export("View", View);
      Self = makeParamDecorator(SelfAnnotation);
      $__export("Self", Self);
      Parent = makeParamDecorator(ParentAnnotation);
      $__export("Parent", Parent);
      Ancestor = makeParamDecorator(AncestorAnnotation);
      $__export("Ancestor", Ancestor);
      Unbounded = makeParamDecorator(UnboundedAnnotation);
      $__export("Unbounded", Unbounded);
      Attribute = makeParamDecorator(AttributeAnnotation);
      $__export("Attribute", Attribute);
      Query = makeParamDecorator(QueryAnnotation);
      $__export("Query", Query);
    }
  };
});

System.register("angular2/src/directives/ng_for", ["angular2/annotations", "angular2/core", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_for";
  var __decorate,
      __metadata,
      Directive,
      ViewContainerRef,
      ProtoViewRef,
      isPresent,
      isBlank,
      ListWrapper,
      NgFor,
      RecordViewTuple;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgFor = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef) {
        this.viewContainer = viewContainer;
        this.protoViewRef = protoViewRef;
      }, {
        set iterableChanges(changes) {
          if (isBlank(changes)) {
            this.viewContainer.clear();
            return ;
          }
          var recordViewTuples = [];
          changes.forEachRemovedItem((function(removedRecord) {
            return ListWrapper.push(recordViewTuples, new RecordViewTuple(removedRecord, null));
          }));
          changes.forEachMovedItem((function(movedRecord) {
            return ListWrapper.push(recordViewTuples, new RecordViewTuple(movedRecord, null));
          }));
          var insertTuples = NgFor.bulkRemove(recordViewTuples, this.viewContainer);
          changes.forEachAddedItem((function(addedRecord) {
            return ListWrapper.push(insertTuples, new RecordViewTuple(addedRecord, null));
          }));
          NgFor.bulkInsert(insertTuples, this.viewContainer, this.protoViewRef);
          for (var i = 0; i < insertTuples.length; i++) {
            this.perViewChange(insertTuples[i].view, insertTuples[i].record);
          }
        },
        perViewChange: function(view, record) {
          view.setLocal('\$implicit', record.item);
          view.setLocal('index', record.currentIndex);
        }
      }, {
        bulkRemove: function(tuples, viewContainer) {
          tuples.sort((function(a, b) {
            return a.record.previousIndex - b.record.previousIndex;
          }));
          var movedTuples = [];
          for (var i = tuples.length - 1; i >= 0; i--) {
            var tuple = tuples[i];
            if (isPresent(tuple.record.currentIndex)) {
              tuple.view = viewContainer.detach(tuple.record.previousIndex);
              ListWrapper.push(movedTuples, tuple);
            } else {
              viewContainer.remove(tuple.record.previousIndex);
            }
          }
          return movedTuples;
        },
        bulkInsert: function(tuples, viewContainer, protoViewRef) {
          tuples.sort((function(a, b) {
            return a.record.currentIndex - b.record.currentIndex;
          }));
          for (var i = 0; i < tuples.length; i++) {
            var tuple = tuples[i];
            if (isPresent(tuple.view)) {
              viewContainer.insert(tuple.view, tuple.record.currentIndex);
            } else {
              tuple.view = viewContainer.create(protoViewRef, tuple.record.currentIndex);
            }
          }
          return tuples;
        }
      }));
      $__export("NgFor", NgFor);
      $__export("NgFor", NgFor = __decorate([Directive({
        selector: '[ng-for][ng-for-of]',
        properties: {'iterableChanges': 'ngForOf | iterableDiff'}
      }), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef])], NgFor));
      RecordViewTuple = (function() {
        function RecordViewTuple(record, view) {
          this.record = record;
          this.view = view;
        }
        return ($traceurRuntime.createClass)(RecordViewTuple, {}, {});
      }());
    }
  };
});

System.register("angular2/src/directives/ng_if", ["angular2/annotations", "angular2/core", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_if";
  var __decorate,
      __metadata,
      Directive,
      ViewContainerRef,
      ProtoViewRef,
      isBlank,
      NgIf;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgIf = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef) {
        this.viewContainer = viewContainer;
        this.prevCondition = null;
        this.protoViewRef = protoViewRef;
      }, {set ngIf(newCondition) {
          if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
            this.prevCondition = true;
            this.viewContainer.create(this.protoViewRef);
          } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
            this.prevCondition = false;
            this.viewContainer.clear();
          }
        }}, {}));
      $__export("NgIf", NgIf);
      $__export("NgIf", NgIf = __decorate([Directive({
        selector: '[ng-if]',
        properties: {'ngIf': 'ngIf'}
      }), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef])], NgIf));
    }
  };
});

System.register("angular2/src/directives/ng_non_bindable", ["angular2/annotations"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_non_bindable";
  var __decorate,
      __metadata,
      Directive,
      NgNonBindable;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      NgNonBindable = (($traceurRuntime.createClass)(function() {}, {}, {}));
      $__export("NgNonBindable", NgNonBindable);
      $__export("NgNonBindable", NgNonBindable = __decorate([Directive({
        selector: '[ng-non-bindable]',
        compileChildren: false
      }), __metadata('design:paramtypes', [])], NgNonBindable));
    }
  };
});

System.register("angular2/src/directives/ng_switch", ["angular2/annotations", "angular2/core", "angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/ng_switch";
  var __decorate,
      __metadata,
      __param,
      Directive,
      Parent,
      ViewContainerRef,
      ProtoViewRef,
      isPresent,
      isBlank,
      normalizeBlank,
      ListWrapper,
      MapWrapper,
      SwitchView,
      NgSwitch,
      NgSwitchWhen,
      NgSwitchDefault,
      _whenDefault;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Parent = $__m.Parent;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      normalizeBlank = $__m.normalizeBlank;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      SwitchView = (function() {
        function SwitchView(viewContainerRef, protoViewRef) {
          this._protoViewRef = protoViewRef;
          this._viewContainerRef = viewContainerRef;
        }
        return ($traceurRuntime.createClass)(SwitchView, {
          create: function() {
            this._viewContainerRef.create(this._protoViewRef);
          },
          destroy: function() {
            this._viewContainerRef.clear();
          }
        }, {});
      }());
      $__export("SwitchView", SwitchView);
      NgSwitch = (($traceurRuntime.createClass)(function() {
        this._valueViews = MapWrapper.create();
        this._activeViews = ListWrapper.create();
        this._useDefault = false;
      }, {
        set ngSwitch(value) {
          this._emptyAllActiveViews();
          this._useDefault = false;
          var views = MapWrapper.get(this._valueViews, value);
          if (isBlank(views)) {
            this._useDefault = true;
            views = normalizeBlank(MapWrapper.get(this._valueViews, _whenDefault));
          }
          this._activateViews(views);
          this._switchValue = value;
        },
        _onWhenValueChanged: function(oldWhen, newWhen, view) {
          this._deregisterView(oldWhen, view);
          this._registerView(newWhen, view);
          if (oldWhen === this._switchValue) {
            view.destroy();
            ListWrapper.remove(this._activeViews, view);
          } else if (newWhen === this._switchValue) {
            if (this._useDefault) {
              this._useDefault = false;
              this._emptyAllActiveViews();
            }
            view.create();
            ListWrapper.push(this._activeViews, view);
          }
          if (this._activeViews.length === 0 && !this._useDefault) {
            this._useDefault = true;
            this._activateViews(MapWrapper.get(this._valueViews, _whenDefault));
          }
        },
        _emptyAllActiveViews: function() {
          var activeContainers = this._activeViews;
          for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
          }
          this._activeViews = ListWrapper.create();
        },
        _activateViews: function(views) {
          if (isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
              views[i].create();
            }
            this._activeViews = views;
          }
        },
        _registerView: function(value, view) {
          var views = MapWrapper.get(this._valueViews, value);
          if (isBlank(views)) {
            views = ListWrapper.create();
            MapWrapper.set(this._valueViews, value, views);
          }
          ListWrapper.push(views, view);
        },
        _deregisterView: function(value, view) {
          if (value == _whenDefault)
            return ;
          var views = MapWrapper.get(this._valueViews, value);
          if (views.length == 1) {
            MapWrapper.delete(this._valueViews, value);
          } else {
            ListWrapper.remove(views, view);
          }
        }
      }, {}));
      $__export("NgSwitch", NgSwitch);
      $__export("NgSwitch", NgSwitch = __decorate([Directive({
        selector: '[ng-switch]',
        properties: {'ngSwitch': 'ngSwitch'}
      }), __metadata('design:paramtypes', [])], NgSwitch));
      NgSwitchWhen = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef, sswitch) {
        this._value = _whenDefault;
        this._switch = sswitch;
        this._view = new SwitchView(viewContainer, protoViewRef);
      }, {
        onDestroy: function() {
          this._switch;
        },
        set ngSwitchWhen(value) {
          this._switch._onWhenValueChanged(this._value, value, this._view);
          this._value = value;
        }
      }, {}));
      $__export("NgSwitchWhen", NgSwitchWhen);
      $__export("NgSwitchWhen", NgSwitchWhen = __decorate([Directive({
        selector: '[ng-switch-when]',
        properties: {'ngSwitchWhen': 'ngSwitchWhen'}
      }), __param(2, Parent()), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef, NgSwitch])], NgSwitchWhen));
      NgSwitchDefault = (($traceurRuntime.createClass)(function(viewContainer, protoViewRef, sswitch) {
        sswitch._registerView(_whenDefault, new SwitchView(viewContainer, protoViewRef));
      }, {}, {}));
      $__export("NgSwitchDefault", NgSwitchDefault);
      $__export("NgSwitchDefault", NgSwitchDefault = __decorate([Directive({selector: '[ng-switch-default]'}), __param(2, Parent()), __metadata('design:paramtypes', [ViewContainerRef, ProtoViewRef, NgSwitch])], NgSwitchDefault));
      _whenDefault = new Object();
    }
  };
});

System.register("angular2/src/directives/class", ["angular2/annotations", "angular2/core", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/directives/class";
  var __decorate,
      __metadata,
      Directive,
      ElementRef,
      isPresent,
      DOM,
      CSSClass;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DOM = $__m.DOM;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      CSSClass = (($traceurRuntime.createClass)(function(ngEl) {
        this._domEl = ngEl.domElement;
      }, {
        _toggleClass: function(className, enabled) {
          if (enabled) {
            DOM.addClass(this._domEl, className);
          } else {
            DOM.removeClass(this._domEl, className);
          }
        },
        set iterableChanges(changes) {
          var $__0 = this;
          if (isPresent(changes)) {
            changes.forEachAddedItem((function(record) {
              $__0._toggleClass(record.key, record.currentValue);
            }));
            changes.forEachChangedItem((function(record) {
              $__0._toggleClass(record.key, record.currentValue);
            }));
            changes.forEachRemovedItem((function(record) {
              if (record.previousValue) {
                DOM.removeClass($__0._domEl, record.key);
              }
            }));
          }
        }
      }, {}));
      $__export("CSSClass", CSSClass);
      $__export("CSSClass", CSSClass = __decorate([Directive({
        selector: '[class]',
        properties: {'iterableChanges': 'class | keyValDiff'}
      }), __metadata('design:paramtypes', [ElementRef])], CSSClass));
    }
  };
});

System.register("angular2/src/forms/validators", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/validators";
  var isBlank,
      isPresent,
      ListWrapper,
      StringMapWrapper,
      Validators;
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      Validators = (function() {
        function Validators() {}
        return ($traceurRuntime.createClass)(Validators, {}, {
          required: function(c) {
            return isBlank(c.value) || c.value == "" ? {"required": true} : null;
          },
          nullValidator: function(c) {
            return null;
          },
          compose: function(validators) {
            return function(c) {
              var res = ListWrapper.reduce(validators, (function(res, validator) {
                var errors = validator(c);
                return isPresent(errors) ? StringMapWrapper.merge(res, errors) : res;
              }), {});
              return StringMapWrapper.isEmpty(res) ? null : res;
            };
          },
          group: function(c) {
            var res = {};
            StringMapWrapper.forEach(c.controls, (function(control, name) {
              if (c.contains(name) && isPresent(control.errors)) {
                Validators._mergeErrors(control, res);
              }
            }));
            return StringMapWrapper.isEmpty(res) ? null : res;
          },
          array: function(c) {
            var res = {};
            ListWrapper.forEach(c.controls, (function(control) {
              if (isPresent(control.errors)) {
                Validators._mergeErrors(control, res);
              }
            }));
            return StringMapWrapper.isEmpty(res) ? null : res;
          },
          _mergeErrors: function(control, res) {
            StringMapWrapper.forEach(control.errors, (function(value, error) {
              if (!StringMapWrapper.contains(res, error)) {
                res[error] = [];
              }
              ListWrapper.push(res[error], control);
            }));
          }
        });
      }());
      $__export("Validators", Validators);
    }
  };
});

System.register("angular2/src/forms/directives", ["angular2/src/core/annotations/decorators", "angular2/src/di/decorators", "angular2/src/core/compiler/element_ref", "angular2/src/render/api", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/forms/model", "angular2/src/forms/validators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/directives";
  var __decorate,
      __metadata,
      __param,
      Directive,
      Ancestor,
      Optional,
      ElementRef,
      Renderer,
      isPresent,
      CONST_EXPR,
      isBlank,
      BaseException,
      ListWrapper,
      isControl,
      Validators,
      ControlGroupDirective,
      ControlDirective,
      DefaultValueAccessor,
      SelectControlValueAccessor,
      CheckboxControlValueAccessor,
      formDirectives;
  function _lookupControl(groupDirective, controlOrName) {
    if (isControl(controlOrName)) {
      return controlOrName;
    }
    if (isBlank(groupDirective)) {
      throw new BaseException(("No control group found for \"" + controlOrName + "\""));
    }
    var control = groupDirective.findControl(controlOrName);
    if (isBlank(control)) {
      throw new BaseException(("Cannot find control \"" + controlOrName + "\""));
    }
    return control;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Ancestor = $__m.Ancestor;
    }, function($__m) {
      Optional = $__m.Optional;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }, function($__m) {
      isPresent = $__m.isPresent;
      CONST_EXPR = $__m.CONST_EXPR;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isControl = $__m.isControl;
    }, function($__m) {
      Validators = $__m.Validators;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      ControlGroupDirective = (($traceurRuntime.createClass)(function(groupDirective) {
        this._groupDirective = groupDirective;
        this._directives = ListWrapper.create();
      }, {
        set controlOrName(controlOrName) {
          this._controlOrName = controlOrName;
          this._updateDomValue();
        },
        _updateDomValue: function() {
          ListWrapper.forEach(this._directives, (function(cd) {
            return cd._updateDomValue();
          }));
        },
        addDirective: function(c) {
          ListWrapper.push(this._directives, c);
        },
        findControl: function(name) {
          return this._getControlGroup().controls[name];
        },
        _getControlGroup: function() {
          return _lookupControl(this._groupDirective, this._controlOrName);
        }
      }, {}));
      $__export("ControlGroupDirective", ControlGroupDirective);
      $__export("ControlGroupDirective", ControlGroupDirective = __decorate([Directive({
        selector: '[control-group]',
        properties: {'controlOrName': 'control-group'}
      }), __param(0, Optional()), __param(0, Ancestor()), __metadata('design:paramtypes', [ControlGroupDirective])], ControlGroupDirective));
      ControlDirective = (($traceurRuntime.createClass)(function(groupDirective) {
        this._groupDirective = groupDirective;
        this._controlOrName = null;
        this.validator = Validators.nullValidator;
      }, {
        set controlOrName(controlOrName) {
          this._controlOrName = controlOrName;
          if (isPresent(this._groupDirective)) {
            this._groupDirective.addDirective(this);
          }
          var c = this._control();
          c.validator = Validators.compose([c.validator, this.validator]);
          if (isBlank(this.valueAccessor)) {
            throw new BaseException(("Cannot find value accessor for control \"" + controlOrName + "\""));
          }
          this._updateDomValue();
          this._setUpUpdateControlValue();
        },
        _updateDomValue: function() {
          this.valueAccessor.writeValue(this._control().value);
        },
        _setUpUpdateControlValue: function() {
          var $__0 = this;
          this.valueAccessor.onChange = (function(newValue) {
            return $__0._control().updateValue(newValue);
          });
        },
        _control: function() {
          return _lookupControl(this._groupDirective, this._controlOrName);
        }
      }, {}));
      $__export("ControlDirective", ControlDirective);
      $__export("ControlDirective", ControlDirective = __decorate([Directive({
        selector: '[control]',
        properties: {'controlOrName': 'control'}
      }), __param(0, Optional()), __param(0, Ancestor()), __metadata('design:paramtypes', [ControlGroupDirective])], ControlDirective));
      DefaultValueAccessor = (($traceurRuntime.createClass)(function(cd, _elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.value = null;
        this.onChange = (function(_) {});
        cd.valueAccessor = this;
      }, {writeValue: function(value) {
          this._renderer.setElementProperty(this._elementRef.parentView.render, this._elementRef.boundElementIndex, 'value', value);
        }}, {}));
      $__export("DefaultValueAccessor", DefaultValueAccessor);
      $__export("DefaultValueAccessor", DefaultValueAccessor = __decorate([Directive({
        selector: 'input:not([type=checkbox])[control],textarea[control]',
        hostListeners: {
          'change': 'onChange($event.target.value)',
          'input': 'onChange($event.target.value)'
        },
        hostProperties: {'value': 'value'}
      }), __metadata('design:paramtypes', [ControlDirective, ElementRef, Renderer])], DefaultValueAccessor));
      SelectControlValueAccessor = (($traceurRuntime.createClass)(function(cd, _elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.value = null;
        this.onChange = (function(_) {});
        this.value = '';
        cd.valueAccessor = this;
      }, {writeValue: function(value) {
          this._renderer.setElementProperty(this._elementRef.parentView.render, this._elementRef.boundElementIndex, 'value', value);
        }}, {}));
      $__export("SelectControlValueAccessor", SelectControlValueAccessor);
      $__export("SelectControlValueAccessor", SelectControlValueAccessor = __decorate([Directive({
        selector: 'select[control]',
        hostListeners: {
          'change': 'onChange($event.target.value)',
          'input': 'onChange($event.target.value)'
        },
        hostProperties: {'value': 'value'}
      }), __metadata('design:paramtypes', [ControlDirective, ElementRef, Renderer])], SelectControlValueAccessor));
      CheckboxControlValueAccessor = (($traceurRuntime.createClass)(function(cd, _elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.onChange = (function(_) {});
        cd.valueAccessor = this;
      }, {writeValue: function(value) {
          this._renderer.setElementProperty(this._elementRef.parentView.render, this._elementRef.boundElementIndex, 'checked', value);
        }}, {}));
      $__export("CheckboxControlValueAccessor", CheckboxControlValueAccessor);
      $__export("CheckboxControlValueAccessor", CheckboxControlValueAccessor = __decorate([Directive({
        selector: 'input[type=checkbox][control]',
        hostListeners: {'change': 'onChange($event.target.checked)'},
        hostProperties: {'checked': 'checked'}
      }), __metadata('design:paramtypes', [ControlDirective, ElementRef, Renderer])], CheckboxControlValueAccessor));
      formDirectives = CONST_EXPR([ControlGroupDirective, ControlDirective, CheckboxControlValueAccessor, DefaultValueAccessor, SelectControlValueAccessor]);
      $__export("formDirectives", formDirectives);
    }
  };
});

System.register("angular2/src/forms/validator_directives", ["angular2/src/core/annotations/decorators", "angular2/src/forms/validators", "angular2/src/forms/directives"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/validator_directives";
  var __decorate,
      __metadata,
      Directive,
      Validators,
      ControlDirective,
      RequiredValidatorDirective;
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      Validators = $__m.Validators;
    }, function($__m) {
      ControlDirective = $__m.ControlDirective;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      RequiredValidatorDirective = (($traceurRuntime.createClass)(function(c) {
        c.validator = Validators.compose([c.validator, Validators.required]);
      }, {}, {}));
      $__export("RequiredValidatorDirective", RequiredValidatorDirective);
      $__export("RequiredValidatorDirective", RequiredValidatorDirective = __decorate([Directive({selector: '[required]'}), __metadata('design:paramtypes', [ControlDirective])], RequiredValidatorDirective));
    }
  };
});

System.register("angular2/src/forms/form_builder", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/forms/model"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/form_builder";
  var StringMapWrapper,
      ListWrapper,
      isPresent,
      modelModule,
      FormBuilder;
  return {
    setters: [function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      modelModule = $__m;
    }],
    execute: function() {
      FormBuilder = (function() {
        function FormBuilder() {}
        return ($traceurRuntime.createClass)(FormBuilder, {
          group: function(controlsConfig) {
            var extra = arguments[1] !== (void 0) ? arguments[1] : null;
            var controls = this._reduceControls(controlsConfig);
            var optionals = isPresent(extra) ? StringMapWrapper.get(extra, "optionals") : null;
            var validator = isPresent(extra) ? StringMapWrapper.get(extra, "validator") : null;
            if (isPresent(validator)) {
              return new modelModule.ControlGroup(controls, optionals, validator);
            } else {
              return new modelModule.ControlGroup(controls, optionals);
            }
          },
          control: function(value) {
            var validator = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isPresent(validator)) {
              return new modelModule.Control(value, validator);
            } else {
              return new modelModule.Control(value);
            }
          },
          array: function(controlsConfig) {
            var validator = arguments[1] !== (void 0) ? arguments[1] : null;
            var $__0 = this;
            var controls = ListWrapper.map(controlsConfig, (function(c) {
              return $__0._createControl(c);
            }));
            if (isPresent(validator)) {
              return new modelModule.ControlArray(controls, validator);
            } else {
              return new modelModule.ControlArray(controls);
            }
          },
          _reduceControls: function(controlsConfig) {
            var $__0 = this;
            var controls = {};
            StringMapWrapper.forEach(controlsConfig, (function(controlConfig, controlName) {
              controls[controlName] = $__0._createControl(controlConfig);
            }));
            return controls;
          },
          _createControl: function(controlConfig) {
            if (controlConfig instanceof modelModule.Control || controlConfig instanceof modelModule.ControlGroup || controlConfig instanceof modelModule.ControlArray) {
              return controlConfig;
            } else if (ListWrapper.isList(controlConfig)) {
              var value = ListWrapper.get(controlConfig, 0);
              var validator = controlConfig.length > 1 ? controlConfig[1] : null;
              return this.control(value, validator);
            } else {
              return this.control(controlConfig);
            }
          }
        }, {});
      }());
      $__export("FormBuilder", FormBuilder);
    }
  };
});

System.register("angular2/src/change_detection/parser/ast", ["angular2/src/facade/lang", "angular2/src/facade/collection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/ast";
  var isPresent,
      FunctionWrapper,
      BaseException,
      ListWrapper,
      StringMapWrapper,
      AST,
      EmptyExpr,
      ImplicitReceiver,
      Chain,
      Conditional,
      AccessMember,
      KeyedAccess,
      Pipe,
      LiteralPrimitive,
      LiteralArray,
      LiteralMap,
      Interpolation,
      Binary,
      PrefixNot,
      Assignment,
      MethodCall,
      FunctionCall,
      ASTWithSource,
      TemplateBinding,
      AstVisitor,
      AstTransformer,
      _evalListCache;
  function evalList(context, locals, exps) {
    var length = exps.length;
    if (length > 10) {
      throw new BaseException("Cannot have more than 10 argument");
    }
    var result = _evalListCache[length];
    for (var i = 0; i < length; i++) {
      result[i] = exps[i].eval(context, locals);
    }
    return result;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      FunctionWrapper = $__m.FunctionWrapper;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }],
    execute: function() {
      AST = (function() {
        function AST() {}
        return ($traceurRuntime.createClass)(AST, {
          eval: function(context, locals) {
            throw new BaseException("Not supported");
          },
          get isAssignable() {
            return false;
          },
          assign: function(context, locals, value) {
            throw new BaseException("Not supported");
          },
          visit: function(visitor) {
            return null;
          },
          toString: function() {
            return "AST";
          }
        }, {});
      }());
      $__export("AST", AST);
      EmptyExpr = (function($__super) {
        function EmptyExpr() {
          $traceurRuntime.superConstructor(EmptyExpr).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(EmptyExpr, {
          eval: function(context, locals) {
            return null;
          },
          visit: function(visitor) {}
        }, {}, $__super);
      }(AST));
      $__export("EmptyExpr", EmptyExpr);
      ImplicitReceiver = (function($__super) {
        function ImplicitReceiver() {
          $traceurRuntime.superConstructor(ImplicitReceiver).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(ImplicitReceiver, {
          eval: function(context, locals) {
            return context;
          },
          visit: function(visitor) {
            return visitor.visitImplicitReceiver(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("ImplicitReceiver", ImplicitReceiver);
      Chain = (function($__super) {
        function Chain(expressions) {
          $traceurRuntime.superConstructor(Chain).call(this);
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(Chain, {
          eval: function(context, locals) {
            var result;
            for (var i = 0; i < this.expressions.length; i++) {
              var last = this.expressions[i].eval(context, locals);
              if (isPresent(last))
                result = last;
            }
            return result;
          },
          visit: function(visitor) {
            return visitor.visitChain(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Chain", Chain);
      Conditional = (function($__super) {
        function Conditional(condition, trueExp, falseExp) {
          $traceurRuntime.superConstructor(Conditional).call(this);
          this.condition = condition;
          this.trueExp = trueExp;
          this.falseExp = falseExp;
        }
        return ($traceurRuntime.createClass)(Conditional, {
          eval: function(context, locals) {
            if (this.condition.eval(context, locals)) {
              return this.trueExp.eval(context, locals);
            } else {
              return this.falseExp.eval(context, locals);
            }
          },
          visit: function(visitor) {
            return visitor.visitConditional(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Conditional", Conditional);
      AccessMember = (function($__super) {
        function AccessMember(receiver, name, getter, setter) {
          $traceurRuntime.superConstructor(AccessMember).call(this);
          this.receiver = receiver;
          this.name = name;
          this.getter = getter;
          this.setter = setter;
        }
        return ($traceurRuntime.createClass)(AccessMember, {
          eval: function(context, locals) {
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              return locals.get(this.name);
            } else {
              var evaluatedReceiver = this.receiver.eval(context, locals);
              return this.getter(evaluatedReceiver);
            }
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, locals, value) {
            var evaluatedContext = this.receiver.eval(context, locals);
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              throw new BaseException(("Cannot reassign a variable binding " + this.name));
            } else {
              return this.setter(evaluatedContext, value);
            }
          },
          visit: function(visitor) {
            return visitor.visitAccessMember(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("AccessMember", AccessMember);
      KeyedAccess = (function($__super) {
        function KeyedAccess(obj, key) {
          $traceurRuntime.superConstructor(KeyedAccess).call(this);
          this.obj = obj;
          this.key = key;
        }
        return ($traceurRuntime.createClass)(KeyedAccess, {
          eval: function(context, locals) {
            var obj = this.obj.eval(context, locals);
            var key = this.key.eval(context, locals);
            return obj[key];
          },
          get isAssignable() {
            return true;
          },
          assign: function(context, locals, value) {
            var obj = this.obj.eval(context, locals);
            var key = this.key.eval(context, locals);
            obj[key] = value;
            return value;
          },
          visit: function(visitor) {
            return visitor.visitKeyedAccess(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("KeyedAccess", KeyedAccess);
      Pipe = (function($__super) {
        function Pipe(exp, name, args, inBinding) {
          $traceurRuntime.superConstructor(Pipe).call(this);
          this.exp = exp;
          this.name = name;
          this.args = args;
          this.inBinding = inBinding;
        }
        return ($traceurRuntime.createClass)(Pipe, {visit: function(visitor) {
            return visitor.visitPipe(this);
          }}, {}, $__super);
      }(AST));
      $__export("Pipe", Pipe);
      LiteralPrimitive = (function($__super) {
        function LiteralPrimitive(value) {
          $traceurRuntime.superConstructor(LiteralPrimitive).call(this);
          this.value = value;
        }
        return ($traceurRuntime.createClass)(LiteralPrimitive, {
          eval: function(context, locals) {
            return this.value;
          },
          visit: function(visitor) {
            return visitor.visitLiteralPrimitive(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralPrimitive", LiteralPrimitive);
      LiteralArray = (function($__super) {
        function LiteralArray(expressions) {
          $traceurRuntime.superConstructor(LiteralArray).call(this);
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(LiteralArray, {
          eval: function(context, locals) {
            return ListWrapper.map(this.expressions, (function(e) {
              return e.eval(context, locals);
            }));
          },
          visit: function(visitor) {
            return visitor.visitLiteralArray(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralArray", LiteralArray);
      LiteralMap = (function($__super) {
        function LiteralMap(keys, values) {
          $traceurRuntime.superConstructor(LiteralMap).call(this);
          this.keys = keys;
          this.values = values;
        }
        return ($traceurRuntime.createClass)(LiteralMap, {
          eval: function(context, locals) {
            var res = StringMapWrapper.create();
            for (var i = 0; i < this.keys.length; ++i) {
              StringMapWrapper.set(res, this.keys[i], this.values[i].eval(context, locals));
            }
            return res;
          },
          visit: function(visitor) {
            return visitor.visitLiteralMap(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("LiteralMap", LiteralMap);
      Interpolation = (function($__super) {
        function Interpolation(strings, expressions) {
          $traceurRuntime.superConstructor(Interpolation).call(this);
          this.strings = strings;
          this.expressions = expressions;
        }
        return ($traceurRuntime.createClass)(Interpolation, {
          eval: function(context, locals) {
            throw new BaseException("evaluating an Interpolation is not supported");
          },
          visit: function(visitor) {
            visitor.visitInterpolation(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Interpolation", Interpolation);
      Binary = (function($__super) {
        function Binary(operation, left, right) {
          $traceurRuntime.superConstructor(Binary).call(this);
          this.operation = operation;
          this.left = left;
          this.right = right;
        }
        return ($traceurRuntime.createClass)(Binary, {
          eval: function(context, locals) {
            var left = this.left.eval(context, locals);
            switch (this.operation) {
              case '&&':
                return left && this.right.eval(context, locals);
              case '||':
                return left || this.right.eval(context, locals);
            }
            var right = this.right.eval(context, locals);
            switch (this.operation) {
              case '+':
                return left + right;
              case '-':
                return left - right;
              case '*':
                return left * right;
              case '/':
                return left / right;
              case '%':
                return left % right;
              case '==':
                return left == right;
              case '!=':
                return left != right;
              case '===':
                return left === right;
              case '!==':
                return left !== right;
              case '<':
                return left < right;
              case '>':
                return left > right;
              case '<=':
                return left <= right;
              case '>=':
                return left >= right;
              case '^':
                return left ^ right;
              case '&':
                return left & right;
            }
            throw 'Internal error [$operation] not handled';
          },
          visit: function(visitor) {
            return visitor.visitBinary(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Binary", Binary);
      PrefixNot = (function($__super) {
        function PrefixNot(expression) {
          $traceurRuntime.superConstructor(PrefixNot).call(this);
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(PrefixNot, {
          eval: function(context, locals) {
            return !this.expression.eval(context, locals);
          },
          visit: function(visitor) {
            return visitor.visitPrefixNot(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("PrefixNot", PrefixNot);
      Assignment = (function($__super) {
        function Assignment(target, value) {
          $traceurRuntime.superConstructor(Assignment).call(this);
          this.target = target;
          this.value = value;
        }
        return ($traceurRuntime.createClass)(Assignment, {
          eval: function(context, locals) {
            return this.target.assign(context, locals, this.value.eval(context, locals));
          },
          visit: function(visitor) {
            return visitor.visitAssignment(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("Assignment", Assignment);
      MethodCall = (function($__super) {
        function MethodCall(receiver, name, fn, args) {
          $traceurRuntime.superConstructor(MethodCall).call(this);
          this.receiver = receiver;
          this.name = name;
          this.fn = fn;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(MethodCall, {
          eval: function(context, locals) {
            var evaluatedArgs = evalList(context, locals, this.args);
            if (this.receiver instanceof ImplicitReceiver && isPresent(locals) && locals.contains(this.name)) {
              var fn = locals.get(this.name);
              return FunctionWrapper.apply(fn, evaluatedArgs);
            } else {
              var evaluatedReceiver = this.receiver.eval(context, locals);
              return this.fn(evaluatedReceiver, evaluatedArgs);
            }
          },
          visit: function(visitor) {
            return visitor.visitMethodCall(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("MethodCall", MethodCall);
      FunctionCall = (function($__super) {
        function FunctionCall(target, args) {
          $traceurRuntime.superConstructor(FunctionCall).call(this);
          this.target = target;
          this.args = args;
        }
        return ($traceurRuntime.createClass)(FunctionCall, {
          eval: function(context, locals) {
            var obj = this.target.eval(context, locals);
            if (!(obj instanceof Function)) {
              throw new BaseException((obj + " is not a function"));
            }
            return FunctionWrapper.apply(obj, evalList(context, locals, this.args));
          },
          visit: function(visitor) {
            return visitor.visitFunctionCall(this);
          }
        }, {}, $__super);
      }(AST));
      $__export("FunctionCall", FunctionCall);
      ASTWithSource = (function($__super) {
        function ASTWithSource(ast, source, location) {
          $traceurRuntime.superConstructor(ASTWithSource).call(this);
          this.ast = ast;
          this.source = source;
          this.location = location;
        }
        return ($traceurRuntime.createClass)(ASTWithSource, {
          eval: function(context, locals) {
            return this.ast.eval(context, locals);
          },
          get isAssignable() {
            return this.ast.isAssignable;
          },
          assign: function(context, locals, value) {
            return this.ast.assign(context, locals, value);
          },
          visit: function(visitor) {
            return this.ast.visit(visitor);
          },
          toString: function() {
            return (this.source + " in " + this.location);
          }
        }, {}, $__super);
      }(AST));
      $__export("ASTWithSource", ASTWithSource);
      TemplateBinding = (function() {
        function TemplateBinding(key, keyIsVar, name, expression) {
          this.key = key;
          this.keyIsVar = keyIsVar;
          this.name = name;
          this.expression = expression;
        }
        return ($traceurRuntime.createClass)(TemplateBinding, {}, {});
      }());
      $__export("TemplateBinding", TemplateBinding);
      AstVisitor = (function() {
        function AstVisitor() {}
        return ($traceurRuntime.createClass)(AstVisitor, {
          visitAccessMember: function(ast) {},
          visitAssignment: function(ast) {},
          visitBinary: function(ast) {},
          visitChain: function(ast) {},
          visitConditional: function(ast) {},
          visitPipe: function(ast) {},
          visitFunctionCall: function(ast) {},
          visitImplicitReceiver: function(ast) {},
          visitKeyedAccess: function(ast) {},
          visitLiteralArray: function(ast) {},
          visitLiteralMap: function(ast) {},
          visitLiteralPrimitive: function(ast) {},
          visitMethodCall: function(ast) {},
          visitPrefixNot: function(ast) {}
        }, {});
      }());
      $__export("AstVisitor", AstVisitor);
      AstTransformer = (function() {
        function AstTransformer() {}
        return ($traceurRuntime.createClass)(AstTransformer, {
          visitImplicitReceiver: function(ast) {
            return ast;
          },
          visitInterpolation: function(ast) {
            return new Interpolation(ast.strings, this.visitAll(ast.expressions));
          },
          visitLiteralPrimitive: function(ast) {
            return new LiteralPrimitive(ast.value);
          },
          visitAccessMember: function(ast) {
            return new AccessMember(ast.receiver.visit(this), ast.name, ast.getter, ast.setter);
          },
          visitMethodCall: function(ast) {
            return new MethodCall(ast.receiver.visit(this), ast.name, ast.fn, this.visitAll(ast.args));
          },
          visitFunctionCall: function(ast) {
            return new FunctionCall(ast.target.visit(this), this.visitAll(ast.args));
          },
          visitLiteralArray: function(ast) {
            return new LiteralArray(this.visitAll(ast.expressions));
          },
          visitLiteralMap: function(ast) {
            return new LiteralMap(ast.keys, this.visitAll(ast.values));
          },
          visitBinary: function(ast) {
            return new Binary(ast.operation, ast.left.visit(this), ast.right.visit(this));
          },
          visitPrefixNot: function(ast) {
            return new PrefixNot(ast.expression.visit(this));
          },
          visitConditional: function(ast) {
            return new Conditional(ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
          },
          visitPipe: function(ast) {
            return new Pipe(ast.exp.visit(this), ast.name, this.visitAll(ast.args), ast.inBinding);
          },
          visitKeyedAccess: function(ast) {
            return new KeyedAccess(ast.obj.visit(this), ast.key.visit(this));
          },
          visitAll: function(asts) {
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          }
        }, {});
      }());
      $__export("AstTransformer", AstTransformer);
      _evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]];
    }
  };
});

System.register("angular2/src/di/annotations", ["angular2/src/di/annotations_impl"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/annotations";
  return {
    setters: [function($__m) {
      $__export("InjectAnnotation", $__m.Inject);
      $__export("InjectPromiseAnnotation", $__m.InjectPromise);
      $__export("InjectLazyAnnotation", $__m.InjectLazy);
      $__export("OptionalAnnotation", $__m.Optional);
      $__export("InjectableAnnotation", $__m.Injectable);
      $__export("DependencyAnnotation", $__m.DependencyAnnotation);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/reflection/reflector", ["angular2/src/facade/collection", "angular2/src/reflection/types"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflector";
  var MapWrapper,
      StringMapWrapper,
      Reflector;
  function _mergeMaps(target, config) {
    StringMapWrapper.forEach(config, (function(v, k) {
      return MapWrapper.set(target, k, v);
    }));
  }
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      $__export("SetterFn", $__m.SetterFn);
      $__export("GetterFn", $__m.GetterFn);
      $__export("MethodFn", $__m.MethodFn);
    }],
    execute: function() {
      Reflector = (function() {
        function Reflector(reflectionCapabilities) {
          this._typeInfo = MapWrapper.create();
          this._getters = MapWrapper.create();
          this._setters = MapWrapper.create();
          this._methods = MapWrapper.create();
          this.reflectionCapabilities = reflectionCapabilities;
        }
        return ($traceurRuntime.createClass)(Reflector, {
          registerType: function(type, typeInfo) {
            MapWrapper.set(this._typeInfo, type, typeInfo);
          },
          registerGetters: function(getters) {
            _mergeMaps(this._getters, getters);
          },
          registerSetters: function(setters) {
            _mergeMaps(this._setters, setters);
          },
          registerMethods: function(methods) {
            _mergeMaps(this._methods, methods);
          },
          factory: function(type) {
            if (MapWrapper.contains(this._typeInfo, type)) {
              return MapWrapper.get(this._typeInfo, type)["factory"];
            } else {
              return this.reflectionCapabilities.factory(type);
            }
          },
          parameters: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return MapWrapper.get(this._typeInfo, typeOfFunc)["parameters"];
            } else {
              return this.reflectionCapabilities.parameters(typeOfFunc);
            }
          },
          annotations: function(typeOfFunc) {
            if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
              return MapWrapper.get(this._typeInfo, typeOfFunc)["annotations"];
            } else {
              return this.reflectionCapabilities.annotations(typeOfFunc);
            }
          },
          getter: function(name) {
            if (MapWrapper.contains(this._getters, name)) {
              return MapWrapper.get(this._getters, name);
            } else {
              return this.reflectionCapabilities.getter(name);
            }
          },
          setter: function(name) {
            if (MapWrapper.contains(this._setters, name)) {
              return MapWrapper.get(this._setters, name);
            } else {
              return this.reflectionCapabilities.setter(name);
            }
          },
          method: function(name) {
            if (MapWrapper.contains(this._methods, name)) {
              return MapWrapper.get(this._methods, name);
            } else {
              return this.reflectionCapabilities.method(name);
            }
          }
        }, {});
      }());
      $__export("Reflector", Reflector);
    }
  };
});

System.register("angular2/src/change_detection/change_detection_util", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/exceptions", "angular2/src/change_detection/pipes/pipe", "angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection_util";
  var isBlank,
      BaseException,
      StringMapWrapper,
      ExpressionChangedAfterItHasBeenChecked,
      WrappedValue,
      CHECK_ALWAYS,
      CHECK_ONCE,
      ON_PUSH,
      uninitialized,
      SimpleChange,
      _simpleChangesIndex,
      _simpleChanges,
      ChangeDetectionUtil;
  function _simpleChange(previousValue, currentValue) {
    var index = _simpleChangesIndex++ % 20;
    var s = _simpleChanges[index];
    s.previousValue = previousValue;
    s.currentValue = currentValue;
    return s;
  }
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      ExpressionChangedAfterItHasBeenChecked = $__m.ExpressionChangedAfterItHasBeenChecked;
    }, function($__m) {
      WrappedValue = $__m.WrappedValue;
    }, function($__m) {
      CHECK_ALWAYS = $__m.CHECK_ALWAYS;
      CHECK_ONCE = $__m.CHECK_ONCE;
      ON_PUSH = $__m.ON_PUSH;
    }],
    execute: function() {
      uninitialized = new Object();
      $__export("uninitialized", uninitialized);
      SimpleChange = (function() {
        function SimpleChange(previousValue, currentValue) {
          this.previousValue = previousValue;
          this.currentValue = currentValue;
        }
        return ($traceurRuntime.createClass)(SimpleChange, {}, {});
      }());
      $__export("SimpleChange", SimpleChange);
      _simpleChangesIndex = 0;
      _simpleChanges = [new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null), new SimpleChange(null, null)];
      ChangeDetectionUtil = (function() {
        function ChangeDetectionUtil() {}
        return ($traceurRuntime.createClass)(ChangeDetectionUtil, {}, {
          uninitialized: function() {
            return uninitialized;
          },
          arrayFn0: function() {
            return [];
          },
          arrayFn1: function(a1) {
            return [a1];
          },
          arrayFn2: function(a1, a2) {
            return [a1, a2];
          },
          arrayFn3: function(a1, a2, a3) {
            return [a1, a2, a3];
          },
          arrayFn4: function(a1, a2, a3, a4) {
            return [a1, a2, a3, a4];
          },
          arrayFn5: function(a1, a2, a3, a4, a5) {
            return [a1, a2, a3, a4, a5];
          },
          arrayFn6: function(a1, a2, a3, a4, a5, a6) {
            return [a1, a2, a3, a4, a5, a6];
          },
          arrayFn7: function(a1, a2, a3, a4, a5, a6, a7) {
            return [a1, a2, a3, a4, a5, a6, a7];
          },
          arrayFn8: function(a1, a2, a3, a4, a5, a6, a7, a8) {
            return [a1, a2, a3, a4, a5, a6, a7, a8];
          },
          arrayFn9: function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return [a1, a2, a3, a4, a5, a6, a7, a8, a9];
          },
          operation_negate: function(value) {
            return !value;
          },
          operation_add: function(left, right) {
            return left + right;
          },
          operation_subtract: function(left, right) {
            return left - right;
          },
          operation_multiply: function(left, right) {
            return left * right;
          },
          operation_divide: function(left, right) {
            return left / right;
          },
          operation_remainder: function(left, right) {
            return left % right;
          },
          operation_equals: function(left, right) {
            return left == right;
          },
          operation_not_equals: function(left, right) {
            return left != right;
          },
          operation_identical: function(left, right) {
            return left === right;
          },
          operation_not_identical: function(left, right) {
            return left !== right;
          },
          operation_less_then: function(left, right) {
            return left < right;
          },
          operation_greater_then: function(left, right) {
            return left > right;
          },
          operation_less_or_equals_then: function(left, right) {
            return left <= right;
          },
          operation_greater_or_equals_then: function(left, right) {
            return left >= right;
          },
          operation_logical_and: function(left, right) {
            return left && right;
          },
          operation_logical_or: function(left, right) {
            return left || right;
          },
          cond: function(cond, trueVal, falseVal) {
            return cond ? trueVal : falseVal;
          },
          mapFn: function(keys) {
            function buildMap(values) {
              var res = StringMapWrapper.create();
              for (var i = 0; i < keys.length; ++i) {
                StringMapWrapper.set(res, keys[i], values[i]);
              }
              return res;
            }
            switch (keys.length) {
              case 0:
                return (function() {
                  return [];
                });
              case 1:
                return (function(a1) {
                  return buildMap([a1]);
                });
              case 2:
                return (function(a1, a2) {
                  return buildMap([a1, a2]);
                });
              case 3:
                return (function(a1, a2, a3) {
                  return buildMap([a1, a2, a3]);
                });
              case 4:
                return (function(a1, a2, a3, a4) {
                  return buildMap([a1, a2, a3, a4]);
                });
              case 5:
                return (function(a1, a2, a3, a4, a5) {
                  return buildMap([a1, a2, a3, a4, a5]);
                });
              case 6:
                return (function(a1, a2, a3, a4, a5, a6) {
                  return buildMap([a1, a2, a3, a4, a5, a6]);
                });
              case 7:
                return (function(a1, a2, a3, a4, a5, a6, a7) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7]);
                });
              case 8:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
                });
              case 9:
                return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                  return buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
                });
              default:
                throw new BaseException("Does not support literal maps with more than 9 elements");
            }
          },
          keyedAccess: function(obj, args) {
            return obj[args[0]];
          },
          unwrapValue: function(value) {
            if (value instanceof WrappedValue) {
              return value.wrapped;
            } else {
              return value;
            }
          },
          throwOnChange: function(proto, change) {
            throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
          },
          changeDetectionMode: function(strategy) {
            return strategy == ON_PUSH ? CHECK_ONCE : CHECK_ALWAYS;
          },
          simpleChange: function(previousValue, currentValue) {
            return _simpleChange(previousValue, currentValue);
          },
          addChange: function(changes, propertyName, change) {
            if (isBlank(changes)) {
              changes = {};
            }
            changes[propertyName] = change;
            return changes;
          }
        });
      }());
      $__export("ChangeDetectionUtil", ChangeDetectionUtil);
    }
  };
});

System.register("angular2/src/change_detection/abstract_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/change_detector_ref", "angular2/src/change_detection/interfaces", "angular2/src/change_detection/constants"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/abstract_change_detector";
  var isPresent,
      ListWrapper,
      ChangeDetectorRef,
      ChangeDetector,
      CHECK_ONCE,
      CHECKED,
      DETACHED,
      AbstractChangeDetector;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
    }, function($__m) {
      ChangeDetector = $__m.ChangeDetector;
    }, function($__m) {
      CHECK_ONCE = $__m.CHECK_ONCE;
      CHECKED = $__m.CHECKED;
      DETACHED = $__m.DETACHED;
    }],
    execute: function() {
      AbstractChangeDetector = (function($__super) {
        function AbstractChangeDetector() {
          $traceurRuntime.superConstructor(AbstractChangeDetector).call(this);
          this.lightDomChildren = [];
          this.shadowDomChildren = [];
          this.ref = new ChangeDetectorRef(this);
          this.mode = null;
        }
        return ($traceurRuntime.createClass)(AbstractChangeDetector, {
          addChild: function(cd) {
            ListWrapper.push(this.lightDomChildren, cd);
            cd.parent = this;
          },
          removeChild: function(cd) {
            ListWrapper.remove(this.lightDomChildren, cd);
          },
          addShadowDomChild: function(cd) {
            ListWrapper.push(this.shadowDomChildren, cd);
            cd.parent = this;
          },
          removeShadowDomChild: function(cd) {
            ListWrapper.remove(this.shadowDomChildren, cd);
          },
          remove: function() {
            this.parent.removeChild(this);
          },
          detectChanges: function() {
            this._detectChanges(false);
          },
          checkNoChanges: function() {
            this._detectChanges(true);
          },
          _detectChanges: function(throwOnChange) {
            if (this.mode === DETACHED || this.mode === CHECKED)
              return ;
            this.detectChangesInRecords(throwOnChange);
            this._detectChangesInLightDomChildren(throwOnChange);
            if (throwOnChange === false)
              this.callOnAllChangesDone();
            this._detectChangesInShadowDomChildren(throwOnChange);
            if (this.mode === CHECK_ONCE)
              this.mode = CHECKED;
          },
          detectChangesInRecords: function(throwOnChange) {},
          callOnAllChangesDone: function() {},
          _detectChangesInLightDomChildren: function(throwOnChange) {
            var c = this.lightDomChildren;
            for (var i = 0; i < c.length; ++i) {
              c[i]._detectChanges(throwOnChange);
            }
          },
          _detectChangesInShadowDomChildren: function(throwOnChange) {
            var c = this.shadowDomChildren;
            for (var i = 0; i < c.length; ++i) {
              c[i]._detectChanges(throwOnChange);
            }
          },
          markAsCheckOnce: function() {
            this.mode = CHECK_ONCE;
          },
          markPathToRootAsCheckOnce: function() {
            var c = this;
            while (isPresent(c) && c.mode != DETACHED) {
              if (c.mode === CHECKED)
                c.mode = CHECK_ONCE;
              c = c.parent;
            }
          }
        }, {}, $__super);
      }(ChangeDetector));
      $__export("AbstractChangeDetector", AbstractChangeDetector);
    }
  };
});

System.register("angular2/src/facade/async", ["angular2/src/facade/lang", "rx"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/facade/async";
  var global,
      Rx,
      Promise,
      PromiseWrapper,
      TimerWrapper,
      ObservableWrapper,
      Observable,
      EventEmitter;
  return {
    setters: [function($__m) {
      global = $__m.global;
    }, function($__m) {
      Rx = $__m;
    }],
    execute: function() {
      Promise = global.Promise;
      $__export("Promise", Promise);
      PromiseWrapper = (function() {
        function PromiseWrapper() {}
        return ($traceurRuntime.createClass)(PromiseWrapper, {}, {
          resolve: function(obj) {
            return Promise.resolve(obj);
          },
          reject: function(obj, _) {
            return Promise.reject(obj);
          },
          catchError: function(promise, onError) {
            return promise.catch(onError);
          },
          all: function(promises) {
            if (promises.length == 0)
              return Promise.resolve([]);
            return Promise.all(promises);
          },
          then: function(promise, success, rejection) {
            return promise.then(success, rejection);
          },
          completer: function() {
            var resolve;
            var reject;
            var p = new Promise(function(res, rej) {
              resolve = res;
              reject = rej;
            });
            return {
              promise: p,
              resolve: resolve,
              reject: reject
            };
          },
          isPromise: function(maybePromise) {
            return maybePromise instanceof Promise;
          }
        });
      }());
      $__export("PromiseWrapper", PromiseWrapper);
      TimerWrapper = (function() {
        function TimerWrapper() {}
        return ($traceurRuntime.createClass)(TimerWrapper, {}, {
          setTimeout: function(fn, millis) {
            return global.setTimeout(fn, millis);
          },
          clearTimeout: function(id) {
            global.clearTimeout(id);
          },
          setInterval: function(fn, millis) {
            return global.setInterval(fn, millis);
          },
          clearInterval: function(id) {
            global.clearInterval(id);
          }
        });
      }());
      $__export("TimerWrapper", TimerWrapper);
      ObservableWrapper = (function() {
        function ObservableWrapper() {}
        return ($traceurRuntime.createClass)(ObservableWrapper, {}, {
          subscribe: function(emitter, onNext) {
            var onThrow = arguments[2] !== (void 0) ? arguments[2] : null;
            var onReturn = arguments[3] !== (void 0) ? arguments[3] : null;
            return emitter.observer({
              next: onNext,
              throw: onThrow,
              return: onReturn
            });
          },
          isObservable: function(obs) {
            return obs instanceof Observable;
          },
          dispose: function(subscription) {
            subscription.dispose();
          },
          callNext: function(emitter, value) {
            emitter.next(value);
          },
          callThrow: function(emitter, error) {
            emitter.throw(error);
          },
          callReturn: function(emitter) {
            emitter.return(null);
          }
        });
      }());
      $__export("ObservableWrapper", ObservableWrapper);
      Observable = (function() {
        function Observable() {}
        return ($traceurRuntime.createClass)(Observable, {observer: function(generator) {
            return null;
          }}, {});
      }());
      $__export("Observable", Observable);
      EventEmitter = (function($__super) {
        function EventEmitter() {
          $traceurRuntime.superConstructor(EventEmitter).call(this);
          if (Rx.hasOwnProperty('default')) {
            this._subject = new Rx.default.Rx.Subject();
            this._immediateScheduler = Rx.default.Rx.Scheduler.immediate;
          } else {
            this._subject = new Rx.Subject();
            this._immediateScheduler = Rx.Scheduler.immediate;
          }
        }
        return ($traceurRuntime.createClass)(EventEmitter, {
          observer: function(generator) {
            return this._subject.observeOn(this._immediateScheduler).subscribe((function(value) {
              setTimeout((function() {
                return generator.next(value);
              }));
            }), (function(error) {
              return generator.throw ? generator.throw(error) : null;
            }), (function() {
              return generator.return ? generator.return() : null;
            }));
          },
          toRx: function() {
            return this._subject;
          },
          next: function(value) {
            this._subject.onNext(value);
          },
          throw: function(error) {
            this._subject.onError(error);
          },
          return: function(value) {
            this._subject.onCompleted();
          }
        }, {}, $__super);
      }(Observable));
      $__export("EventEmitter", EventEmitter);
    }
  };
});

System.register("angular2/src/core/annotations/visibility", ["angular2/src/core/annotations_impl/visibility"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/visibility";
  return {
    setters: [function($__m) {
      $__export("SelfAnnotation", $__m.Self);
      $__export("AncestorAnnotation", $__m.Ancestor);
      $__export("ParentAnnotation", $__m.Parent);
      $__export("UnboundedAnnotation", $__m.Unbounded);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/annotations/view", ["angular2/src/core/annotations_impl/view"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/annotations/view";
  return {
    setters: [function($__m) {
      $__export("ViewAnnotation", $__m.View);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/di/key", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/di/type_literal", "angular2/src/di/forward_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/key";
  var MapWrapper,
      stringify,
      isBlank,
      BaseException,
      TypeLiteral,
      resolveForwardRef,
      Key,
      KeyRegistry,
      _globalKeyRegistry;
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      stringify = $__m.stringify;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      TypeLiteral = $__m.TypeLiteral;
      $__export("TypeLiteral", $__m.TypeLiteral);
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      Key = (function() {
        function Key(token, id) {
          if (isBlank(token)) {
            throw new BaseException('Token must be defined!');
          }
          this.token = token;
          this.id = id;
        }
        return ($traceurRuntime.createClass)(Key, {get displayName() {
            return stringify(this.token);
          }}, {
          get: function(token) {
            return _globalKeyRegistry.get(resolveForwardRef(token));
          },
          get numberOfKeys() {
            return _globalKeyRegistry.numberOfKeys;
          }
        });
      }());
      $__export("Key", Key);
      KeyRegistry = (function() {
        function KeyRegistry() {
          this._allKeys = MapWrapper.create();
        }
        return ($traceurRuntime.createClass)(KeyRegistry, {
          get: function(token) {
            if (token instanceof Key)
              return token;
            var theToken = token;
            if (token instanceof TypeLiteral) {
              theToken = token.type;
            }
            token = theToken;
            if (MapWrapper.contains(this._allKeys, token)) {
              return MapWrapper.get(this._allKeys, token);
            }
            var newKey = new Key(token, Key.numberOfKeys);
            MapWrapper.set(this._allKeys, token, newKey);
            return newKey;
          },
          get numberOfKeys() {
            return MapWrapper.size(this._allKeys);
          }
        }, {});
      }());
      $__export("KeyRegistry", KeyRegistry);
      _globalKeyRegistry = new KeyRegistry();
    }
  };
});

System.register("angular2/src/dom/browser_adapter", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/dom/generic_browser_adapter"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/dom/browser_adapter";
  var MapWrapper,
      ListWrapper,
      isBlank,
      isPresent,
      setRootDomAdapter,
      GenericBrowserDomAdapter,
      _attrToPropMap,
      DOM_KEY_LOCATION_NUMPAD,
      _keyMap,
      _chromeNumKeyPadMap,
      BrowserDomAdapter,
      urlParsingNode;
  function relativePath(url) {
    if (isBlank(urlParsingNode)) {
      urlParsingNode = document.createElement("a");
    }
    urlParsingNode.setAttribute('href', url);
    return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname;
  }
  return {
    setters: [function($__m) {
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      setRootDomAdapter = $__m.setRootDomAdapter;
    }, function($__m) {
      GenericBrowserDomAdapter = $__m.GenericBrowserDomAdapter;
    }],
    execute: function() {
      _attrToPropMap = {
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex'
      };
      DOM_KEY_LOCATION_NUMPAD = 3;
      _keyMap = {
        '\b': 'Backspace',
        '\t': 'Tab',
        '\x7F': 'Delete',
        '\x1B': 'Escape',
        'Del': 'Delete',
        'Esc': 'Escape',
        'Left': 'ArrowLeft',
        'Right': 'ArrowRight',
        'Up': 'ArrowUp',
        'Down': 'ArrowDown',
        'Menu': 'ContextMenu',
        'Scroll': 'ScrollLock',
        'Win': 'OS'
      };
      _chromeNumKeyPadMap = {
        'A': '1',
        'B': '2',
        'C': '3',
        'D': '4',
        'E': '5',
        'F': '6',
        'G': '7',
        'H': '8',
        'I': '9',
        'J': '*',
        'K': '+',
        'M': '-',
        'N': '.',
        'O': '/',
        '\x60': '0',
        '\x90': 'NumLock'
      };
      BrowserDomAdapter = (function($__super) {
        function BrowserDomAdapter() {
          $traceurRuntime.superConstructor(BrowserDomAdapter).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(BrowserDomAdapter, {
          logError: function(error) {
            window.console.error(error);
          },
          get attrToPropMap() {
            return _attrToPropMap;
          },
          query: function(selector) {
            return document.querySelector(selector);
          },
          querySelector: function(el, selector) {
            return el.querySelector(selector);
          },
          querySelectorAll: function(el, selector) {
            return el.querySelectorAll(selector);
          },
          on: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
          },
          onAndCancel: function(el, evt, listener) {
            el.addEventListener(evt, listener, false);
            return (function() {
              el.removeEventListener(evt, listener, false);
            });
          },
          dispatchEvent: function(el, evt) {
            el.dispatchEvent(evt);
          },
          createMouseEvent: function(eventType) {
            var evt = new MouseEvent(eventType);
            evt.initEvent(eventType, true, true);
            return evt;
          },
          createEvent: function(eventType) {
            return new Event(eventType, true);
          },
          getInnerHTML: function(el) {
            return el.innerHTML;
          },
          getOuterHTML: function(el) {
            return el.outerHTML;
          },
          nodeName: function(node) {
            return node.nodeName;
          },
          nodeValue: function(node) {
            return node.nodeValue;
          },
          type: function(node) {
            return node.type;
          },
          content: function(node) {
            if (this.hasProperty(node, "content")) {
              return node.content;
            } else {
              return node;
            }
          },
          firstChild: function(el) {
            return el.firstChild;
          },
          nextSibling: function(el) {
            return el.nextSibling;
          },
          parentElement: function(el) {
            return el.parentElement;
          },
          childNodes: function(el) {
            return el.childNodes;
          },
          childNodesAsList: function(el) {
            var childNodes = el.childNodes;
            var res = ListWrapper.createFixedSize(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
              res[i] = childNodes[i];
            }
            return res;
          },
          clearNodes: function(el) {
            for (var i = 0; i < el.childNodes.length; i++) {
              this.remove(el.childNodes[i]);
            }
          },
          appendChild: function(el, node) {
            el.appendChild(node);
          },
          removeChild: function(el, node) {
            el.removeChild(node);
          },
          replaceChild: function(el, newChild, oldChild) {
            el.replaceChild(newChild, oldChild);
          },
          remove: function(el) {
            var parent = el.parentNode;
            parent.removeChild(el);
            return el;
          },
          insertBefore: function(el, node) {
            el.parentNode.insertBefore(node, el);
          },
          insertAllBefore: function(el, nodes) {
            ListWrapper.forEach(nodes, (function(n) {
              el.parentNode.insertBefore(n, el);
            }));
          },
          insertAfter: function(el, node) {
            el.parentNode.insertBefore(node, el.nextSibling);
          },
          setInnerHTML: function(el, value) {
            el.innerHTML = value;
          },
          getText: function(el) {
            return el.textContent;
          },
          setText: function(el, value) {
            el.textContent = value;
          },
          getValue: function(el) {
            return el.value;
          },
          setValue: function(el, value) {
            el.value = value;
          },
          getChecked: function(el) {
            return el.checked;
          },
          setChecked: function(el, value) {
            el.checked = value;
          },
          createTemplate: function(html) {
            var t = document.createElement('template');
            t.innerHTML = html;
            return t;
          },
          createElement: function(tagName) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            return doc.createElement(tagName);
          },
          createTextNode: function(text) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            return doc.createTextNode(text);
          },
          createScriptTag: function(attrName, attrValue) {
            var doc = arguments[2] !== (void 0) ? arguments[2] : document;
            var el = doc.createElement('SCRIPT');
            el.setAttribute(attrName, attrValue);
            return el;
          },
          createStyleElement: function(css) {
            var doc = arguments[1] !== (void 0) ? arguments[1] : document;
            var style = doc.createElement('STYLE');
            style.innerText = css;
            return style;
          },
          createShadowRoot: function(el) {
            return el.createShadowRoot();
          },
          getShadowRoot: function(el) {
            return el.shadowRoot;
          },
          getHost: function(el) {
            return el.host;
          },
          clone: function(node) {
            return node.cloneNode(true);
          },
          hasProperty: function(element, name) {
            return name in element;
          },
          getElementsByClassName: function(element, name) {
            return element.getElementsByClassName(name);
          },
          getElementsByTagName: function(element, name) {
            return element.getElementsByTagName(name);
          },
          classList: function(element) {
            return Array.prototype.slice.call(element.classList, 0);
          },
          addClass: function(element, classname) {
            element.classList.add(classname);
          },
          removeClass: function(element, classname) {
            element.classList.remove(classname);
          },
          hasClass: function(element, classname) {
            return element.classList.contains(classname);
          },
          setStyle: function(element, stylename, stylevalue) {
            element.style[stylename] = stylevalue;
          },
          removeStyle: function(element, stylename) {
            element.style[stylename] = null;
          },
          getStyle: function(element, stylename) {
            return element.style[stylename];
          },
          tagName: function(element) {
            return element.tagName;
          },
          attributeMap: function(element) {
            var res = MapWrapper.create();
            var elAttrs = element.attributes;
            for (var i = 0; i < elAttrs.length; i++) {
              var attrib = elAttrs[i];
              MapWrapper.set(res, attrib.name, attrib.value);
            }
            return res;
          },
          hasAttribute: function(element, attribute) {
            return element.hasAttribute(attribute);
          },
          getAttribute: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          setAttribute: function(element, name, value) {
            element.setAttribute(name, value);
          },
          removeAttribute: function(element, attribute) {
            return element.removeAttribute(attribute);
          },
          templateAwareRoot: function(el) {
            return this.isTemplateElement(el) ? this.content(el) : el;
          },
          createHtmlDocument: function() {
            return document.implementation.createHTMLDocument('fakeTitle');
          },
          defaultDoc: function() {
            return document;
          },
          getBoundingClientRect: function(el) {
            return el.getBoundingClientRect();
          },
          getTitle: function() {
            return document.title;
          },
          setTitle: function(newTitle) {
            document.title = newTitle;
          },
          elementMatches: function(n, selector) {
            return n instanceof HTMLElement && n.matches(selector);
          },
          isTemplateElement: function(el) {
            return el instanceof HTMLElement && el.nodeName == "TEMPLATE";
          },
          isTextNode: function(node) {
            return node.nodeType === Node.TEXT_NODE;
          },
          isCommentNode: function(node) {
            return node.nodeType === Node.COMMENT_NODE;
          },
          isElementNode: function(node) {
            return node.nodeType === Node.ELEMENT_NODE;
          },
          hasShadowRoot: function(node) {
            return node instanceof HTMLElement && isPresent(node.shadowRoot);
          },
          isShadowRoot: function(node) {
            return node instanceof DocumentFragment;
          },
          importIntoDoc: function(node) {
            var toImport = node;
            if (this.isTemplateElement(node)) {
              toImport = this.content(node);
            }
            return document.importNode(toImport, true);
          },
          isPageRule: function(rule) {
            return rule.type === CSSRule.PAGE_RULE;
          },
          isStyleRule: function(rule) {
            return rule.type === CSSRule.STYLE_RULE;
          },
          isMediaRule: function(rule) {
            return rule.type === CSSRule.MEDIA_RULE;
          },
          isKeyframesRule: function(rule) {
            return rule.type === CSSRule.KEYFRAMES_RULE;
          },
          getHref: function(el) {
            return el.href;
          },
          getEventKey: function(event) {
            var key = event.key;
            if (isBlank(key)) {
              key = event.keyIdentifier;
              if (isBlank(key)) {
                return 'Unidentified';
              }
              if (key.startsWith('U+')) {
                key = String.fromCharCode(parseInt(key.substring(2), 16));
                if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
                  key = _chromeNumKeyPadMap[key];
                }
              }
            }
            if (_keyMap.hasOwnProperty(key)) {
              key = _keyMap[key];
            }
            return key;
          },
          getGlobalEventTarget: function(target) {
            if (target == "window") {
              return window;
            } else if (target == "document") {
              return document;
            } else if (target == "body") {
              return document.body;
            }
          },
          getHistory: function() {
            return window.history;
          },
          getLocation: function() {
            return window.location;
          },
          getBaseHref: function() {
            return relativePath(document.baseURI);
          }
        }, {makeCurrent: function() {
            setRootDomAdapter(new BrowserDomAdapter());
          }}, $__super);
      }(GenericBrowserDomAdapter));
      $__export("BrowserDomAdapter", BrowserDomAdapter);
      urlParsingNode = null;
    }
  };
});

System.register("angular2/src/core/compiler/directive_resolver", ["angular2/di", "angular2/src/facade/lang", "angular2/src/core/annotations_impl/annotations", "angular2/src/reflection/reflection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/directive_resolver";
  var __decorate,
      __metadata,
      resolveForwardRef,
      Injectable,
      isPresent,
      BaseException,
      stringify,
      Directive,
      reflector,
      DirectiveResolver;
  return {
    setters: [function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      stringify = $__m.stringify;
    }, function($__m) {
      Directive = $__m.Directive;
    }, function($__m) {
      reflector = $__m.reflector;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      DirectiveResolver = (($traceurRuntime.createClass)(function() {}, {resolve: function(type) {
          var annotations = reflector.annotations(resolveForwardRef(type));
          if (isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
              var annotation = annotations[i];
              if (annotation instanceof Directive) {
                return annotation;
              }
            }
          }
          throw new BaseException(("No Directive annotation found on " + stringify(type)));
        }}, {}));
      $__export("DirectiveResolver", DirectiveResolver);
      $__export("DirectiveResolver", DirectiveResolver = __decorate([Injectable(), __metadata('design:paramtypes', [])], DirectiveResolver));
    }
  };
});

System.register("angular2/src/core/compiler/view", ["angular2/src/facade/collection", "angular2/change_detection", "angular2/src/core/compiler/element_binder", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view";
  var ListWrapper,
      MapWrapper,
      StringMapWrapper,
      Locals,
      ElementBinder,
      isPresent,
      isBlank,
      BaseException,
      AppViewContainer,
      AppView,
      AppProtoView;
  return {
    setters: [function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      Locals = $__m.Locals;
    }, function($__m) {
      ElementBinder = $__m.ElementBinder;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      AppViewContainer = (function() {
        function AppViewContainer() {
          this.views = [];
        }
        return ($traceurRuntime.createClass)(AppViewContainer, {}, {});
      }());
      $__export("AppViewContainer", AppViewContainer);
      AppView = (function() {
        function AppView(renderer, proto, protoLocals) {
          this.renderer = renderer;
          this.proto = proto;
          this.render = null;
          this.changeDetector = null;
          this.elementInjectors = null;
          this.rootElementInjectors = null;
          this.componentChildViews = null;
          this.viewContainers = ListWrapper.createFixedSize(this.proto.elementBinders.length);
          this.preBuiltObjects = null;
          this.context = null;
          this.locals = new Locals(null, MapWrapper.clone(protoLocals));
          this.freeHostViews = [];
        }
        return ($traceurRuntime.createClass)(AppView, {
          init: function(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, componentChildViews) {
            this.changeDetector = changeDetector;
            this.elementInjectors = elementInjectors;
            this.rootElementInjectors = rootElementInjectors;
            this.preBuiltObjects = preBuiltObjects;
            this.componentChildViews = componentChildViews;
          },
          setLocal: function(contextName, value) {
            if (!this.hydrated())
              throw new BaseException('Cannot set locals on dehydrated view.');
            if (!MapWrapper.contains(this.proto.variableBindings, contextName)) {
              return ;
            }
            var templateName = MapWrapper.get(this.proto.variableBindings, contextName);
            this.locals.set(templateName, value);
          },
          hydrated: function() {
            return isPresent(this.context);
          },
          triggerEventHandlers: function(eventName, eventObj, binderIndex) {
            var locals = MapWrapper.create();
            MapWrapper.set(locals, '$event', eventObj);
            this.dispatchEvent(binderIndex, eventName, locals);
          },
          notifyOnBinding: function(b, currentValue) {
            if (b.isElement()) {
              this.renderer.setElementProperty(this.render, b.elementIndex, b.propertyName, currentValue);
            } else {
              this.renderer.setText(this.render, b.elementIndex, currentValue);
            }
          },
          getDirectiveFor: function(directive) {
            var elementInjector = this.elementInjectors[directive.elementIndex];
            return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
          },
          getDetectorFor: function(directive) {
            var childView = this.componentChildViews[directive.elementIndex];
            return isPresent(childView) ? childView.changeDetector : null;
          },
          callAction: function(elementIndex, actionExpression, action) {
            this.renderer.callAction(this.render, elementIndex, actionExpression, action);
          },
          dispatchEvent: function(elementIndex, eventName, locals) {
            var $__0 = this;
            var allowDefaultBehavior = true;
            if (this.hydrated()) {
              var elBinder = this.proto.elementBinders[elementIndex];
              if (isBlank(elBinder.hostListeners))
                return allowDefaultBehavior;
              var eventMap = elBinder.hostListeners[eventName];
              if (isBlank(eventMap))
                return allowDefaultBehavior;
              MapWrapper.forEach(eventMap, (function(expr, directiveIndex) {
                var context;
                if (directiveIndex === -1) {
                  context = $__0.context;
                } else {
                  context = $__0.elementInjectors[elementIndex].getDirectiveAtIndex(directiveIndex);
                }
                var result = expr.eval(context, new Locals($__0.locals, locals));
                if (isPresent(result)) {
                  allowDefaultBehavior = allowDefaultBehavior && result == true;
                }
              }));
            }
            return allowDefaultBehavior;
          }
        }, {});
      }());
      $__export("AppView", AppView);
      AppProtoView = (function() {
        function AppProtoView(render, protoChangeDetector, variableBindings) {
          var $__0 = this;
          this.render = render;
          this.protoChangeDetector = protoChangeDetector;
          this.variableBindings = variableBindings;
          this.elementBinders = [];
          this.protoLocals = MapWrapper.create();
          if (isPresent(variableBindings)) {
            MapWrapper.forEach(variableBindings, (function(templateName, _) {
              MapWrapper.set($__0.protoLocals, templateName, null);
            }));
          }
        }
        return ($traceurRuntime.createClass)(AppProtoView, {
          bindElement: function(parent, distanceToParent, protoElementInjector) {
            var componentDirective = arguments[3] !== (void 0) ? arguments[3] : null;
            var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent, protoElementInjector, componentDirective);
            ListWrapper.push(this.elementBinders, elBinder);
            return elBinder;
          },
          bindEvent: function(eventBindings, boundElementIndex) {
            var directiveIndex = arguments[2] !== (void 0) ? arguments[2] : -1;
            var elBinder = this.elementBinders[boundElementIndex];
            var events = elBinder.hostListeners;
            if (isBlank(events)) {
              events = StringMapWrapper.create();
              elBinder.hostListeners = events;
            }
            for (var i = 0; i < eventBindings.length; i++) {
              var eventBinding = eventBindings[i];
              var eventName = eventBinding.fullName;
              var event = StringMapWrapper.get(events, eventName);
              if (isBlank(event)) {
                event = MapWrapper.create();
                StringMapWrapper.set(events, eventName, event);
              }
              MapWrapper.set(event, directiveIndex, eventBinding.source);
            }
          }
        }, {});
      }());
      $__export("AppProtoView", AppProtoView);
    }
  };
});

System.register("angular2/src/core/compiler/element_ref", ["angular2/src/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/render/dom/view/view"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_ref";
  var DOM,
      normalizeBlank,
      resolveInternalDomView,
      ElementRef;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      normalizeBlank = $__m.normalizeBlank;
    }, function($__m) {
      resolveInternalDomView = $__m.resolveInternalDomView;
    }],
    execute: function() {
      ElementRef = (function() {
        function ElementRef(parentView, boundElementIndex) {
          this.parentView = parentView;
          this.boundElementIndex = boundElementIndex;
        }
        return ($traceurRuntime.createClass)(ElementRef, {
          get domElement() {
            return resolveInternalDomView(this.parentView.render).boundElements[this.boundElementIndex];
          },
          getAttribute: function(name) {
            return normalizeBlank(DOM.getAttribute(this.domElement, name));
          }
        }, {});
      }());
      $__export("ElementRef", ElementRef);
    }
  };
});

System.register("angular2/src/core/compiler/query_list", ["angular2/src/core/compiler/base_query_list"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/query_list";
  var BaseQueryList,
      QueryList;
  return {
    setters: [function($__m) {
      BaseQueryList = $__m.BaseQueryList;
    }],
    execute: function() {
      QueryList = (function($__super) {
        function QueryList() {
          $traceurRuntime.superConstructor(QueryList).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(QueryList, {
          onChange: function(callback) {
            return $traceurRuntime.superGet(this, QueryList.prototype, "onChange").call(this, callback);
          },
          removeCallback: function(callback) {
            return $traceurRuntime.superGet(this, QueryList.prototype, "removeCallback").call(this, callback);
          }
        }, {}, $__super);
      }(BaseQueryList));
      $__export("QueryList", QueryList);
    }
  };
});

System.register("angular2/src/render/dom/compiler/template_loader", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/dom/dom_adapter", "angular2/src/services/xhr", "angular2/src/services/url_resolver"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/template_loader";
  var __decorate,
      __metadata,
      Injectable,
      isBlank,
      isPresent,
      BaseException,
      StringMapWrapper,
      PromiseWrapper,
      DOM,
      XHR,
      UrlResolver,
      TemplateLoader;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      TemplateLoader = (($traceurRuntime.createClass)(function(xhr, urlResolver) {
        this._xhr = xhr;
        this._htmlCache = StringMapWrapper.create();
      }, {load: function(template) {
          if (isPresent(template.template)) {
            return PromiseWrapper.resolve(DOM.createTemplate(template.template));
          }
          var url = template.absUrl;
          if (isPresent(url)) {
            var promise = StringMapWrapper.get(this._htmlCache, url);
            if (isBlank(promise)) {
              promise = this._xhr.get(url).then(function(html) {
                var template = DOM.createTemplate(html);
                return template;
              });
              StringMapWrapper.set(this._htmlCache, url, promise);
            }
            return promise.then((function(tplElement) {
              return DOM.clone(tplElement);
            }));
          }
          throw new BaseException('View should have either the url or template property set');
        }}, {}));
      $__export("TemplateLoader", TemplateLoader);
      $__export("TemplateLoader", TemplateLoader = __decorate([Injectable(), __metadata('design:paramtypes', [XHR, UrlResolver])], TemplateLoader));
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/util", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/shadow_css"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/util";
  var isBlank,
      isPresent,
      MapWrapper,
      DOM,
      ShadowCss,
      _componentUIDs,
      _nextComponentUID,
      _sharedStyleTexts,
      _lastInsertedStyleEl;
  function getComponentId(componentStringId) {
    var id = MapWrapper.get(_componentUIDs, componentStringId);
    if (isBlank(id)) {
      id = _nextComponentUID++;
      MapWrapper.set(_componentUIDs, componentStringId, id);
    }
    return id;
  }
  function insertSharedStyleText(cssText, styleHost, styleEl) {
    if (!MapWrapper.contains(_sharedStyleTexts, cssText)) {
      MapWrapper.set(_sharedStyleTexts, cssText, true);
      insertStyleElement(styleHost, styleEl);
    }
  }
  function insertStyleElement(host, styleEl) {
    if (isBlank(_lastInsertedStyleEl)) {
      var firstChild = DOM.firstChild(host);
      if (isPresent(firstChild)) {
        DOM.insertBefore(firstChild, styleEl);
      } else {
        DOM.appendChild(host, styleEl);
      }
    } else {
      DOM.insertAfter(_lastInsertedStyleEl, styleEl);
    }
    _lastInsertedStyleEl = styleEl;
  }
  function getHostAttribute(id) {
    return ("_nghost-" + id);
  }
  function getContentAttribute(id) {
    return ("_ngcontent-" + id);
  }
  function shimCssForComponent(cssText, componentId) {
    var id = getComponentId(componentId);
    var shadowCss = new ShadowCss();
    return shadowCss.shimCssText(cssText, getContentAttribute(id), getHostAttribute(id));
  }
  function resetShadowDomCache() {
    MapWrapper.clear(_componentUIDs);
    _nextComponentUID = 0;
    MapWrapper.clear(_sharedStyleTexts);
    _lastInsertedStyleEl = null;
  }
  $__export("getComponentId", getComponentId);
  $__export("insertSharedStyleText", insertSharedStyleText);
  $__export("insertStyleElement", insertStyleElement);
  $__export("getHostAttribute", getHostAttribute);
  $__export("getContentAttribute", getContentAttribute);
  $__export("shimCssForComponent", shimCssForComponent);
  $__export("resetShadowDomCache", resetShadowDomCache);
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ShadowCss = $__m.ShadowCss;
    }],
    execute: function() {
      _componentUIDs = MapWrapper.create();
      _nextComponentUID = 0;
      _sharedStyleTexts = MapWrapper.create();
    }
  };
});

System.register("angular2/src/render/dom/events/hammer_gestures", ["angular2/src/render/dom/events/hammer_common", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/events/hammer_gestures";
  var HammerGesturesPluginCommon,
      isPresent,
      BaseException,
      HammerGesturesPlugin;
  return {
    setters: [function($__m) {
      HammerGesturesPluginCommon = $__m.HammerGesturesPluginCommon;
    }, function($__m) {
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      HammerGesturesPlugin = (function($__super) {
        function HammerGesturesPlugin() {
          $traceurRuntime.superConstructor(HammerGesturesPlugin).call(this);
        }
        return ($traceurRuntime.createClass)(HammerGesturesPlugin, {
          supports: function(eventName) {
            if (!$traceurRuntime.superGet(this, HammerGesturesPlugin.prototype, "supports").call(this, eventName))
              return false;
            if (!isPresent(window['Hammer'])) {
              throw new BaseException(("Hammer.js is not loaded, can not bind " + eventName + " event"));
            }
            return true;
          },
          addEventListener: function(element, eventName, handler, shouldSupportBubble) {
            if (shouldSupportBubble)
              throw new BaseException('Hammer.js plugin does not support bubbling gestures.');
            var zone = this.manager.getZone();
            eventName = eventName.toLowerCase();
            zone.runOutsideAngular(function() {
              var mc = new Hammer(element);
              mc.get('pinch').set({enable: true});
              mc.get('rotate').set({enable: true});
              mc.on(eventName, function(eventObj) {
                zone.run(function() {
                  handler(eventObj);
                });
              });
            });
          }
        }, {}, $__super);
      }(HammerGesturesPluginCommon));
      $__export("HammerGesturesPlugin", HammerGesturesPlugin);
    }
  };
});

System.register("angular2/src/core/testability/testability", ["angular2/di", "angular2/src/dom/dom_adapter", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/testability/get_testability"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/testability/testability";
  var __decorate,
      __metadata,
      Injectable,
      DOM,
      MapWrapper,
      ListWrapper,
      BaseException,
      getTestabilityModule,
      Testability,
      TestabilityRegistry;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      getTestabilityModule = $__m;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Testability = (($traceurRuntime.createClass)(function() {
        this._pendingCount = 0;
        this._callbacks = ListWrapper.create();
      }, {
        increaseCount: function() {
          var delta = arguments[0] !== (void 0) ? arguments[0] : 1;
          this._pendingCount += delta;
          if (this._pendingCount < 0) {
            throw new BaseException('pending async requests below zero');
          } else if (this._pendingCount == 0) {
            this._runCallbacks();
          }
          return this._pendingCount;
        },
        _runCallbacks: function() {
          while (this._callbacks.length !== 0) {
            ListWrapper.removeLast(this._callbacks)();
          }
        },
        whenStable: function(callback) {
          ListWrapper.push(this._callbacks, callback);
          if (this._pendingCount === 0) {
            this._runCallbacks();
          }
        },
        getPendingCount: function() {
          return this._pendingCount;
        },
        findBindings: function(using, binding, exactMatch) {
          return [];
        }
      }, {}));
      $__export("Testability", Testability);
      $__export("Testability", Testability = __decorate([Injectable(), __metadata('design:paramtypes', [])], Testability));
      TestabilityRegistry = (($traceurRuntime.createClass)(function() {
        this._applications = MapWrapper.create();
        getTestabilityModule.GetTestability.addToWindow(this);
      }, {
        registerApplication: function(token, testability) {
          MapWrapper.set(this._applications, token, testability);
        },
        findTestabilityInTree: function(elem) {
          if (elem == null) {
            return null;
          }
          if (MapWrapper.contains(this._applications, elem)) {
            return MapWrapper.get(this._applications, elem);
          }
          if (DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(DOM.getHost(elem));
          }
          return this.findTestabilityInTree(DOM.parentElement(elem));
        }
      }, {}));
      $__export("TestabilityRegistry", TestabilityRegistry);
      $__export("TestabilityRegistry", TestabilityRegistry = __decorate([Injectable(), __metadata('design:paramtypes', [])], TestabilityRegistry));
    }
  };
});

System.register("angular2/src/render/dom/view/proto_view", ["angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/util", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/proto_view";
  var isPresent,
      DOM,
      NG_BINDING_CLASS,
      RenderProtoViewRef,
      DomProtoViewRef,
      DomProtoView;
  function resolveInternalDomProtoView(protoViewRef) {
    return protoViewRef._protoView;
  }
  $__export("resolveInternalDomProtoView", resolveInternalDomProtoView);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
    }, function($__m) {
      RenderProtoViewRef = $__m.RenderProtoViewRef;
    }],
    execute: function() {
      DomProtoViewRef = (function($__super) {
        function DomProtoViewRef(protoView) {
          $traceurRuntime.superConstructor(DomProtoViewRef).call(this);
          this._protoView = protoView;
        }
        return ($traceurRuntime.createClass)(DomProtoViewRef, {}, {}, $__super);
      }(RenderProtoViewRef));
      $__export("DomProtoViewRef", DomProtoViewRef);
      DomProtoView = (function() {
        function DomProtoView($__1) {
          var $__2 = $__1,
              elementBinders = $__2.elementBinders,
              element = $__2.element;
          this.element = element;
          this.elementBinders = elementBinders;
          this.isTemplateElement = DOM.isTemplateElement(this.element);
          this.rootBindingOffset = (isPresent(this.element) && DOM.hasClass(this.element, NG_BINDING_CLASS)) ? 1 : 0;
        }
        return ($traceurRuntime.createClass)(DomProtoView, {}, {});
      }());
      $__export("DomProtoView", DomProtoView);
    }
  };
});

System.register("angular2/src/render/dom/view/proto_view_builder", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/change_detection", "angular2/src/render/dom/view/proto_view", "angular2/src/render/dom/view/element_binder", "angular2/src/render/dom/view/property_setter_factory", "angular2/src/render/api", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/view/proto_view_builder";
  var isPresent,
      isBlank,
      BaseException,
      ListWrapper,
      MapWrapper,
      DOM,
      ASTWithSource,
      AstTransformer,
      AccessMember,
      LiteralArray,
      ImplicitReceiver,
      DomProtoView,
      DomProtoViewRef,
      resolveInternalDomProtoView,
      ElementBinder,
      Event,
      HostAction,
      setterFactory,
      api,
      NG_BINDING_CLASS,
      EVENT_TARGET_SEPARATOR,
      ProtoViewBuilder,
      ElementBinderBuilder,
      DirectiveBuilder,
      EventBuilder;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ASTWithSource = $__m.ASTWithSource;
      AstTransformer = $__m.AstTransformer;
      AccessMember = $__m.AccessMember;
      LiteralArray = $__m.LiteralArray;
      ImplicitReceiver = $__m.ImplicitReceiver;
    }, function($__m) {
      DomProtoView = $__m.DomProtoView;
      DomProtoViewRef = $__m.DomProtoViewRef;
      resolveInternalDomProtoView = $__m.resolveInternalDomProtoView;
    }, function($__m) {
      ElementBinder = $__m.ElementBinder;
      Event = $__m.Event;
      HostAction = $__m.HostAction;
    }, function($__m) {
      setterFactory = $__m.setterFactory;
    }, function($__m) {
      api = $__m;
    }, function($__m) {
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
      EVENT_TARGET_SEPARATOR = $__m.EVENT_TARGET_SEPARATOR;
    }],
    execute: function() {
      ProtoViewBuilder = (function() {
        function ProtoViewBuilder(rootElement, type) {
          this.rootElement = rootElement;
          this.elements = [];
          this.variableBindings = MapWrapper.create();
          this.type = type;
        }
        return ($traceurRuntime.createClass)(ProtoViewBuilder, {
          bindElement: function(element) {
            var description = arguments[1] !== (void 0) ? arguments[1] : null;
            var builder = new ElementBinderBuilder(this.elements.length, element, description);
            ListWrapper.push(this.elements, builder);
            DOM.addClass(element, NG_BINDING_CLASS);
            return builder;
          },
          bindVariable: function(name, value) {
            MapWrapper.set(this.variableBindings, value, name);
          },
          build: function() {
            var renderElementBinders = [];
            var apiElementBinders = [];
            ListWrapper.forEach(this.elements, (function(ebb) {
              var propertySetters = MapWrapper.create();
              var hostActions = MapWrapper.create();
              var apiDirectiveBinders = ListWrapper.map(ebb.directives, (function(dbb) {
                ebb.eventBuilder.merge(dbb.eventBuilder);
                MapWrapper.forEach(dbb.hostPropertyBindings, (function(_, hostPropertyName) {
                  MapWrapper.set(propertySetters, hostPropertyName, setterFactory(hostPropertyName));
                }));
                ListWrapper.forEach(dbb.hostActions, (function(hostAction) {
                  MapWrapper.set(hostActions, hostAction.actionExpression, hostAction.expression);
                }));
                return new api.DirectiveBinder({
                  directiveIndex: dbb.directiveIndex,
                  propertyBindings: dbb.propertyBindings,
                  eventBindings: dbb.eventBindings,
                  hostPropertyBindings: dbb.hostPropertyBindings
                });
              }));
              MapWrapper.forEach(ebb.propertyBindings, (function(_, propertyName) {
                MapWrapper.set(propertySetters, propertyName, setterFactory(propertyName));
              }));
              var nestedProtoView = isPresent(ebb.nestedProtoView) ? ebb.nestedProtoView.build() : null;
              var parentIndex = isPresent(ebb.parent) ? ebb.parent.index : -1;
              ListWrapper.push(apiElementBinders, new api.ElementBinder({
                index: ebb.index,
                parentIndex: parentIndex,
                distanceToParent: ebb.distanceToParent,
                directives: apiDirectiveBinders,
                nestedProtoView: nestedProtoView,
                propertyBindings: ebb.propertyBindings,
                variableBindings: ebb.variableBindings,
                eventBindings: ebb.eventBindings,
                textBindings: ebb.textBindings,
                readAttributes: ebb.readAttributes
              }));
              ListWrapper.push(renderElementBinders, new ElementBinder({
                textNodeIndices: ebb.textBindingIndices,
                contentTagSelector: ebb.contentTagSelector,
                parentIndex: parentIndex,
                distanceToParent: ebb.distanceToParent,
                nestedProtoView: isPresent(nestedProtoView) ? resolveInternalDomProtoView(nestedProtoView.render) : null,
                componentId: ebb.componentId,
                eventLocals: new LiteralArray(ebb.eventBuilder.buildEventLocals()),
                localEvents: ebb.eventBuilder.buildLocalEvents(),
                globalEvents: ebb.eventBuilder.buildGlobalEvents(),
                hostActions: hostActions,
                propertySetters: propertySetters
              }));
            }));
            return new api.ProtoViewDto({
              render: new DomProtoViewRef(new DomProtoView({
                element: this.rootElement,
                elementBinders: renderElementBinders
              })),
              type: this.type,
              elementBinders: apiElementBinders,
              variableBindings: this.variableBindings
            });
          }
        }, {});
      }());
      $__export("ProtoViewBuilder", ProtoViewBuilder);
      ElementBinderBuilder = (function() {
        function ElementBinderBuilder(index, element, description) {
          this.element = element;
          this.index = index;
          this.parent = null;
          this.distanceToParent = 0;
          this.directives = [];
          this.nestedProtoView = null;
          this.propertyBindings = MapWrapper.create();
          this.variableBindings = MapWrapper.create();
          this.eventBindings = ListWrapper.create();
          this.eventBuilder = new EventBuilder();
          this.textBindings = [];
          this.textBindingIndices = [];
          this.contentTagSelector = null;
          this.componentId = null;
          this.readAttributes = MapWrapper.create();
        }
        return ($traceurRuntime.createClass)(ElementBinderBuilder, {
          setParent: function(parent, distanceToParent) {
            this.parent = parent;
            if (isPresent(parent)) {
              this.distanceToParent = distanceToParent;
            }
            return this;
          },
          readAttribute: function(attrName) {
            if (isBlank(MapWrapper.get(this.readAttributes, attrName))) {
              MapWrapper.set(this.readAttributes, attrName, DOM.getAttribute(this.element, attrName));
            }
          },
          bindDirective: function(directiveIndex) {
            var directive = new DirectiveBuilder(directiveIndex);
            ListWrapper.push(this.directives, directive);
            return directive;
          },
          bindNestedProtoView: function(rootElement) {
            if (isPresent(this.nestedProtoView)) {
              throw new BaseException('Only one nested view per element is allowed');
            }
            this.nestedProtoView = new ProtoViewBuilder(rootElement, api.ProtoViewDto.EMBEDDED_VIEW_TYPE);
            return this.nestedProtoView;
          },
          bindProperty: function(name, expression) {
            MapWrapper.set(this.propertyBindings, name, expression);
          },
          bindVariable: function(name, value) {
            if (isPresent(this.nestedProtoView)) {
              this.nestedProtoView.bindVariable(name, value);
            } else {
              MapWrapper.set(this.variableBindings, value, name);
            }
          },
          bindEvent: function(name, expression) {
            var target = arguments[2] !== (void 0) ? arguments[2] : null;
            ListWrapper.push(this.eventBindings, this.eventBuilder.add(name, expression, target));
          },
          bindText: function(index, expression) {
            ListWrapper.push(this.textBindingIndices, index);
            ListWrapper.push(this.textBindings, expression);
          },
          setContentTagSelector: function(value) {
            this.contentTagSelector = value;
          },
          setComponentId: function(componentId) {
            this.componentId = componentId;
          }
        }, {});
      }());
      $__export("ElementBinderBuilder", ElementBinderBuilder);
      DirectiveBuilder = (function() {
        function DirectiveBuilder(directiveIndex) {
          this.directiveIndex = directiveIndex;
          this.propertyBindings = MapWrapper.create();
          this.hostPropertyBindings = MapWrapper.create();
          this.hostActions = ListWrapper.create();
          this.eventBindings = ListWrapper.create();
          this.eventBuilder = new EventBuilder();
        }
        return ($traceurRuntime.createClass)(DirectiveBuilder, {
          bindProperty: function(name, expression) {
            MapWrapper.set(this.propertyBindings, name, expression);
          },
          bindHostProperty: function(name, expression) {
            MapWrapper.set(this.hostPropertyBindings, name, expression);
          },
          bindHostAction: function(actionName, actionExpression, expression) {
            ListWrapper.push(this.hostActions, new HostAction(actionName, actionExpression, expression));
          },
          bindEvent: function(name, expression) {
            var target = arguments[2] !== (void 0) ? arguments[2] : null;
            ListWrapper.push(this.eventBindings, this.eventBuilder.add(name, expression, target));
          }
        }, {});
      }());
      $__export("DirectiveBuilder", DirectiveBuilder);
      EventBuilder = (function($__super) {
        function EventBuilder() {
          $traceurRuntime.superConstructor(EventBuilder).call(this);
          this.locals = [];
          this.localEvents = [];
          this.globalEvents = [];
          this._implicitReceiver = new ImplicitReceiver();
        }
        return ($traceurRuntime.createClass)(EventBuilder, {
          add: function(name, source, target) {
            var adjustedAst = source.ast;
            var fullName = isPresent(target) ? target + EVENT_TARGET_SEPARATOR + name : name;
            var result = new api.EventBinding(fullName, new ASTWithSource(adjustedAst, source.source, source.location));
            var event = new Event(name, target, fullName);
            if (isBlank(target)) {
              ListWrapper.push(this.localEvents, event);
            } else {
              ListWrapper.push(this.globalEvents, event);
            }
            return result;
          },
          visitAccessMember: function(ast) {
            var isEventAccess = false;
            var current = ast;
            while (!isEventAccess && (current instanceof AccessMember)) {
              var am = current;
              if (am.name == '$event') {
                isEventAccess = true;
              }
              current = am.receiver;
            }
            if (isEventAccess) {
              ListWrapper.push(this.locals, ast);
              var index = this.locals.length - 1;
              return new AccessMember(this._implicitReceiver, ("" + index), (function(arr) {
                return arr[index];
              }), null);
            } else {
              return ast;
            }
          },
          buildEventLocals: function() {
            return this.locals;
          },
          buildLocalEvents: function() {
            return this.localEvents;
          },
          buildGlobalEvents: function() {
            return this.globalEvents;
          },
          merge: function(eventBuilder) {
            this._merge(this.localEvents, eventBuilder.localEvents);
            this._merge(this.globalEvents, eventBuilder.globalEvents);
            ListWrapper.concat(this.locals, eventBuilder.locals);
          },
          _merge: function(host, tobeAdded) {
            var names = ListWrapper.create();
            for (var i = 0; i < host.length; i++) {
              ListWrapper.push(names, host[i].fullName);
            }
            for (var j = 0; j < tobeAdded.length; j++) {
              if (!ListWrapper.contains(names, tobeAdded[j].fullName)) {
                ListWrapper.push(host, tobeAdded[j]);
              }
            }
          }
        }, {}, $__super);
      }(AstTransformer));
      $__export("EventBuilder", EventBuilder);
    }
  };
});

System.register("angular2/src/render/dom/compiler/directive_parser", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/compiler/selector", "angular2/src/render/api", "angular2/src/render/dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/directive_parser";
  var isPresent,
      isBlank,
      BaseException,
      StringWrapper,
      MapWrapper,
      ListWrapper,
      DOM,
      SelectorMatcher,
      CssSelector,
      DirectiveMetadata,
      dashCaseToCamelCase,
      camelCaseToDashCase,
      EVENT_TARGET_SEPARATOR,
      DirectiveParser;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
    }, function($__m) {
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      SelectorMatcher = $__m.SelectorMatcher;
      CssSelector = $__m.CssSelector;
    }, function($__m) {
      DirectiveMetadata = $__m.DirectiveMetadata;
    }, function($__m) {
      dashCaseToCamelCase = $__m.dashCaseToCamelCase;
      camelCaseToDashCase = $__m.camelCaseToDashCase;
      EVENT_TARGET_SEPARATOR = $__m.EVENT_TARGET_SEPARATOR;
    }],
    execute: function() {
      DirectiveParser = (function() {
        function DirectiveParser(parser, directives) {
          this._parser = parser;
          this._selectorMatcher = new SelectorMatcher();
          this._directives = directives;
          for (var i = 0; i < directives.length; i++) {
            var directive = directives[i];
            var selector = CssSelector.parse(directive.selector);
            this._ensureComponentOnlyHasElementSelector(selector, directive);
            this._selectorMatcher.addSelectables(selector, i);
          }
        }
        return ($traceurRuntime.createClass)(DirectiveParser, {
          _ensureComponentOnlyHasElementSelector: function(selector, directive) {
            var isElementSelector = selector.length === 1 && selector[0].isElementSelector();
            if (!isElementSelector && directive.type === DirectiveMetadata.COMPONENT_TYPE) {
              throw new BaseException(("Component '" + directive.id + "' can only have an element selector, but had '" + directive.selector + "'"));
            }
          },
          process: function(parent, current, control) {
            var $__0 = this;
            var attrs = current.attrs();
            var classList = current.classList();
            var cssSelector = new CssSelector();
            var nodeName = DOM.nodeName(current.element);
            cssSelector.setElement(nodeName);
            for (var i = 0; i < classList.length; i++) {
              cssSelector.addClassName(classList[i]);
            }
            MapWrapper.forEach(attrs, (function(attrValue, attrName) {
              cssSelector.addAttribute(attrName, attrValue);
            }));
            var componentDirective;
            var foundDirectiveIndices = [];
            var elementBinder = null;
            this._selectorMatcher.match(cssSelector, (function(selector, directiveIndex) {
              elementBinder = current.bindElement();
              var directive = $__0._directives[directiveIndex];
              if (directive.type === DirectiveMetadata.COMPONENT_TYPE) {
                ListWrapper.insert(foundDirectiveIndices, 0, directiveIndex);
                if (isPresent(componentDirective)) {
                  throw new BaseException(("Only one component directive is allowed per element - check " + current.elementDescription));
                }
                componentDirective = directive;
                elementBinder.setComponentId(directive.id);
              } else {
                ListWrapper.push(foundDirectiveIndices, directiveIndex);
              }
            }));
            ListWrapper.forEach(foundDirectiveIndices, (function(directiveIndex) {
              var directive = $__0._directives[directiveIndex];
              var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
              current.compileChildren = current.compileChildren && directive.compileChildren;
              if (isPresent(directive.properties)) {
                MapWrapper.forEach(directive.properties, (function(bindConfig, dirProperty) {
                  $__0._bindDirectiveProperty(dirProperty, bindConfig, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(directive.hostListeners)) {
                MapWrapper.forEach(directive.hostListeners, (function(action, eventName) {
                  $__0._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(directive.hostActions)) {
                MapWrapper.forEach(directive.hostActions, (function(action, actionName) {
                  $__0._bindHostAction(actionName, action, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(directive.hostProperties)) {
                MapWrapper.forEach(directive.hostProperties, (function(hostPropertyName, directivePropertyName) {
                  $__0._bindHostProperty(hostPropertyName, directivePropertyName, current, directiveBinderBuilder);
                }));
              }
              if (isPresent(directive.hostAttributes)) {
                MapWrapper.forEach(directive.hostAttributes, (function(hostAttrValue, hostAttrName) {
                  $__0._addHostAttribute(hostAttrName, hostAttrValue, current);
                }));
              }
              if (isPresent(directive.readAttributes)) {
                ListWrapper.forEach(directive.readAttributes, (function(attrName) {
                  elementBinder.readAttribute(attrName);
                }));
              }
            }));
          },
          _bindDirectiveProperty: function(dirProperty, bindConfig, compileElement, directiveBinderBuilder) {
            var pipes = this._splitBindConfig(bindConfig);
            var elProp = ListWrapper.removeAt(pipes, 0);
            var bindingAst = MapWrapper.get(compileElement.bindElement().propertyBindings, dashCaseToCamelCase(elProp));
            if (isBlank(bindingAst)) {
              var attributeValue = MapWrapper.get(compileElement.attrs(), camelCaseToDashCase(elProp));
              if (isPresent(attributeValue)) {
                bindingAst = this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
              }
            }
            if (isPresent(bindingAst)) {
              var fullExpAstWithBindPipes = this._parser.addPipes(bindingAst, pipes);
              directiveBinderBuilder.bindProperty(dirProperty, fullExpAstWithBindPipes);
            }
          },
          _bindDirectiveEvent: function(eventName, action, compileElement, directiveBinderBuilder) {
            var ast = this._parser.parseAction(action, compileElement.elementDescription);
            if (StringWrapper.contains(eventName, EVENT_TARGET_SEPARATOR)) {
              var parts = eventName.split(EVENT_TARGET_SEPARATOR);
              directiveBinderBuilder.bindEvent(parts[1], ast, parts[0]);
            } else {
              directiveBinderBuilder.bindEvent(eventName, ast);
            }
          },
          _bindHostAction: function(actionName, actionExpression, compileElement, directiveBinderBuilder) {
            var ast = this._parser.parseAction(actionExpression, compileElement.elementDescription);
            directiveBinderBuilder.bindHostAction(actionName, actionExpression, ast);
          },
          _bindHostProperty: function(hostPropertyName, directivePropertyName, compileElement, directiveBinderBuilder) {
            var ast = this._parser.parseBinding(directivePropertyName, ("hostProperties of " + compileElement.elementDescription));
            directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
          },
          _addHostAttribute: function(attrName, attrValue, compileElement) {
            if (StringWrapper.equals(attrName, 'class')) {
              ListWrapper.forEach(attrValue.split(' '), (function(className) {
                DOM.addClass(compileElement.element, className);
              }));
            } else if (!DOM.hasAttribute(compileElement.element, attrName)) {
              DOM.setAttribute(compileElement.element, attrName, attrValue);
            }
          },
          _splitBindConfig: function(bindConfig) {
            return ListWrapper.map(bindConfig.split('|'), (function(s) {
              return s.trim();
            }));
          }
        }, {});
      }());
      $__export("DirectiveParser", DirectiveParser);
    }
  };
});

System.register("angular2/annotations", ["angular2/src/core/annotations/annotations", "angular2/src/core/annotations/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/annotations";
  var $__exportNames = {};
  var $__exportNames = {};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }],
    execute: function() {}
  };
});

System.register("angular2/directives", ["angular2/src/facade/lang", "angular2/src/directives/ng_for", "angular2/src/directives/ng_if", "angular2/src/directives/ng_non_bindable", "angular2/src/directives/ng_switch", "angular2/src/directives/class"], function($__export) {
  "use strict";
  var __moduleName = "angular2/directives";
  var CONST_EXPR,
      NgFor,
      NgIf,
      NgNonBindable,
      NgSwitch,
      NgSwitchWhen,
      NgSwitchDefault,
      coreDirectives;
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  var $__exportNames = {coreDirectives: true};
  return {
    setters: [function($__m) {
      CONST_EXPR = $__m.CONST_EXPR;
    }, function($__m) {
      NgFor = $__m.NgFor;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgIf = $__m.NgIf;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgNonBindable = $__m.NgNonBindable;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      NgSwitch = $__m.NgSwitch;
      NgSwitchWhen = $__m.NgSwitchWhen;
      NgSwitchDefault = $__m.NgSwitchDefault;
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }],
    execute: function() {
      coreDirectives = CONST_EXPR([NgFor, NgIf, NgNonBindable, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
      $__export("coreDirectives", coreDirectives);
    }
  };
});

System.register("angular2/src/forms/model", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/forms/validators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/forms/model";
  var isPresent,
      EventEmitter,
      ObservableWrapper,
      StringMapWrapper,
      ListWrapper,
      Validators,
      VALID,
      INVALID,
      AbstractControl,
      Control,
      ControlGroup,
      ControlArray;
  function isControl(c) {
    return c instanceof AbstractControl;
  }
  $__export("isControl", isControl);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      EventEmitter = $__m.EventEmitter;
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      Validators = $__m.Validators;
    }],
    execute: function() {
      VALID = "VALID";
      $__export("VALID", VALID);
      INVALID = "INVALID";
      $__export("INVALID", INVALID);
      AbstractControl = (function() {
        function AbstractControl(validator) {
          this.validator = validator;
          this._pristine = true;
        }
        return ($traceurRuntime.createClass)(AbstractControl, {
          get value() {
            return this._value;
          },
          get status() {
            return this._status;
          },
          get valid() {
            return this._status === VALID;
          },
          get errors() {
            return this._errors;
          },
          get pristine() {
            return this._pristine;
          },
          get dirty() {
            return !this.pristine;
          },
          get valueChanges() {
            return this._valueChanges;
          },
          setParent: function(parent) {
            this._parent = parent;
          },
          _updateParent: function() {
            if (isPresent(this._parent)) {
              this._parent._updateValue();
            }
          }
        }, {});
      }());
      $__export("AbstractControl", AbstractControl);
      Control = (function($__super) {
        function Control(value) {
          var validator = arguments[1] !== (void 0) ? arguments[1] : Validators.nullValidator;
          $traceurRuntime.superConstructor(Control).call(this, validator);
          this._setValueErrorsStatus(value);
          this._valueChanges = new EventEmitter();
        }
        return ($traceurRuntime.createClass)(Control, {
          updateValue: function(value) {
            this._setValueErrorsStatus(value);
            this._pristine = false;
            ObservableWrapper.callNext(this._valueChanges, this._value);
            this._updateParent();
          },
          _setValueErrorsStatus: function(value) {
            this._value = value;
            this._errors = this.validator(this);
            this._status = isPresent(this._errors) ? INVALID : VALID;
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("Control", Control);
      ControlGroup = (function($__super) {
        function ControlGroup(controls) {
          var optionals = arguments[1] !== (void 0) ? arguments[1] : null;
          var validator = arguments[2] !== (void 0) ? arguments[2] : Validators.group;
          $traceurRuntime.superConstructor(ControlGroup).call(this, validator);
          this.controls = controls;
          this._optionals = isPresent(optionals) ? optionals : {};
          this._valueChanges = new EventEmitter();
          this._setParentForControls();
          this._setValueErrorsStatus();
        }
        return ($traceurRuntime.createClass)(ControlGroup, {
          include: function(controlName) {
            StringMapWrapper.set(this._optionals, controlName, true);
            this._updateValue();
          },
          exclude: function(controlName) {
            StringMapWrapper.set(this._optionals, controlName, false);
            this._updateValue();
          },
          contains: function(controlName) {
            var c = StringMapWrapper.contains(this.controls, controlName);
            return c && this._included(controlName);
          },
          _setParentForControls: function() {
            var $__0 = this;
            StringMapWrapper.forEach(this.controls, (function(control, name) {
              control.setParent($__0);
            }));
          },
          _updateValue: function() {
            this._setValueErrorsStatus();
            this._pristine = false;
            ObservableWrapper.callNext(this._valueChanges, this._value);
            this._updateParent();
          },
          _setValueErrorsStatus: function() {
            this._value = this._reduceValue();
            this._errors = this.validator(this);
            this._status = isPresent(this._errors) ? INVALID : VALID;
          },
          _reduceValue: function() {
            return this._reduceChildren({}, (function(acc, control, name) {
              acc[name] = control.value;
              return acc;
            }));
          },
          _reduceChildren: function(initValue, fn) {
            var $__0 = this;
            var res = initValue;
            StringMapWrapper.forEach(this.controls, (function(control, name) {
              if ($__0._included(name)) {
                res = fn(res, control, name);
              }
            }));
            return res;
          },
          _included: function(controlName) {
            var isOptional = StringMapWrapper.contains(this._optionals, controlName);
            return !isOptional || StringMapWrapper.get(this._optionals, controlName);
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("ControlGroup", ControlGroup);
      ControlArray = (function($__super) {
        function ControlArray(controls) {
          var validator = arguments[1] !== (void 0) ? arguments[1] : Validators.array;
          $traceurRuntime.superConstructor(ControlArray).call(this, validator);
          this.controls = controls;
          this._valueChanges = new EventEmitter();
          this._setParentForControls();
          this._setValueErrorsStatus();
        }
        return ($traceurRuntime.createClass)(ControlArray, {
          at: function(index) {
            return this.controls[index];
          },
          push: function(control) {
            ListWrapper.push(this.controls, control);
            control.setParent(this);
            this._updateValue();
          },
          insert: function(index, control) {
            ListWrapper.insert(this.controls, index, control);
            control.setParent(this);
            this._updateValue();
          },
          removeAt: function(index) {
            ListWrapper.removeAt(this.controls, index);
            this._updateValue();
          },
          get length() {
            return this.controls.length;
          },
          _updateValue: function() {
            this._setValueErrorsStatus();
            this._pristine = false;
            ObservableWrapper.callNext(this._valueChanges, this._value);
            this._updateParent();
          },
          _setParentForControls: function() {
            var $__0 = this;
            ListWrapper.forEach(this.controls, (function(control) {
              control.setParent($__0);
            }));
          },
          _setValueErrorsStatus: function() {
            this._value = ListWrapper.map(this.controls, (function(c) {
              return c.value;
            }));
            this._errors = this.validator(this);
            this._status = isPresent(this._errors) ? INVALID : VALID;
          }
        }, {}, $__super);
      }(AbstractControl));
      $__export("ControlArray", ControlArray);
    }
  };
});

System.register("angular2/src/di/decorators", ["angular2/src/di/annotations", "angular2/src/util/decorators"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/decorators";
  var InjectAnnotation,
      InjectPromiseAnnotation,
      InjectLazyAnnotation,
      OptionalAnnotation,
      InjectableAnnotation,
      makeDecorator,
      makeParamDecorator,
      Inject,
      InjectPromise,
      InjectLazy,
      Optional,
      Injectable;
  return {
    setters: [function($__m) {
      InjectAnnotation = $__m.InjectAnnotation;
      InjectPromiseAnnotation = $__m.InjectPromiseAnnotation;
      InjectLazyAnnotation = $__m.InjectLazyAnnotation;
      OptionalAnnotation = $__m.OptionalAnnotation;
      InjectableAnnotation = $__m.InjectableAnnotation;
    }, function($__m) {
      makeDecorator = $__m.makeDecorator;
      makeParamDecorator = $__m.makeParamDecorator;
    }],
    execute: function() {
      Inject = makeParamDecorator(InjectAnnotation);
      $__export("Inject", Inject);
      InjectPromise = makeParamDecorator(InjectPromiseAnnotation);
      $__export("InjectPromise", InjectPromise);
      InjectLazy = makeParamDecorator(InjectLazyAnnotation);
      $__export("InjectLazy", InjectLazy);
      Optional = makeParamDecorator(OptionalAnnotation);
      $__export("Optional", Optional);
      Injectable = makeDecorator(InjectableAnnotation);
      $__export("Injectable", Injectable);
    }
  };
});

System.register("angular2/src/reflection/reflection", ["angular2/src/reflection/reflector", "angular2/src/reflection/reflection_capabilities"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/reflection/reflection";
  var Reflector,
      ReflectionCapabilities,
      reflector;
  return {
    setters: [function($__m) {
      Reflector = $__m.Reflector;
      $__export("Reflector", $__m.Reflector);
    }, function($__m) {
      ReflectionCapabilities = $__m.ReflectionCapabilities;
    }],
    execute: function() {
      reflector = new Reflector(new ReflectionCapabilities());
      $__export("reflector", reflector);
    }
  };
});

System.register("angular2/src/change_detection/dynamic_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/abstract_change_detector", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/proto_record", "angular2/src/change_detection/exceptions"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/dynamic_change_detector";
  var isPresent,
      isBlank,
      BaseException,
      FunctionWrapper,
      ListWrapper,
      AbstractChangeDetector,
      ChangeDetectionUtil,
      uninitialized,
      RECORD_TYPE_SELF,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_LOCAL,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_PRIMITIVE_OP,
      RECORD_TYPE_KEYED_ACCESS,
      RECORD_TYPE_PIPE,
      RECORD_TYPE_BINDING_PIPE,
      RECORD_TYPE_INTERPOLATE,
      ChangeDetectionError,
      DynamicChangeDetector;
  function isSame(a, b) {
    if (a === b)
      return true;
    if (a instanceof String && b instanceof String && a == b)
      return true;
    if ((a !== a) && (b !== b))
      return true;
    return false;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      FunctionWrapper = $__m.FunctionWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      AbstractChangeDetector = $__m.AbstractChangeDetector;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
      uninitialized = $__m.uninitialized;
    }, function($__m) {
      RECORD_TYPE_SELF = $__m.RECORD_TYPE_SELF;
      RECORD_TYPE_PROPERTY = $__m.RECORD_TYPE_PROPERTY;
      RECORD_TYPE_LOCAL = $__m.RECORD_TYPE_LOCAL;
      RECORD_TYPE_INVOKE_METHOD = $__m.RECORD_TYPE_INVOKE_METHOD;
      RECORD_TYPE_CONST = $__m.RECORD_TYPE_CONST;
      RECORD_TYPE_INVOKE_CLOSURE = $__m.RECORD_TYPE_INVOKE_CLOSURE;
      RECORD_TYPE_PRIMITIVE_OP = $__m.RECORD_TYPE_PRIMITIVE_OP;
      RECORD_TYPE_KEYED_ACCESS = $__m.RECORD_TYPE_KEYED_ACCESS;
      RECORD_TYPE_PIPE = $__m.RECORD_TYPE_PIPE;
      RECORD_TYPE_BINDING_PIPE = $__m.RECORD_TYPE_BINDING_PIPE;
      RECORD_TYPE_INTERPOLATE = $__m.RECORD_TYPE_INTERPOLATE;
    }, function($__m) {
      ChangeDetectionError = $__m.ChangeDetectionError;
    }],
    execute: function() {
      DynamicChangeDetector = (function($__super) {
        function DynamicChangeDetector(changeControlStrategy, dispatcher, pipeRegistry, protos, directiveRecords) {
          $traceurRuntime.superConstructor(DynamicChangeDetector).call(this);
          this.changeControlStrategy = changeControlStrategy;
          this.dispatcher = dispatcher;
          this.pipeRegistry = pipeRegistry;
          this.protos = protos;
          this.directiveRecords = directiveRecords;
          this.values = ListWrapper.createFixedSize(protos.length + 1);
          this.pipes = ListWrapper.createFixedSize(protos.length + 1);
          this.prevContexts = ListWrapper.createFixedSize(protos.length + 1);
          this.changes = ListWrapper.createFixedSize(protos.length + 1);
          ListWrapper.fill(this.values, uninitialized);
          ListWrapper.fill(this.pipes, null);
          ListWrapper.fill(this.prevContexts, uninitialized);
          ListWrapper.fill(this.changes, false);
          this.locals = null;
          this.directives = null;
        }
        return ($traceurRuntime.createClass)(DynamicChangeDetector, {
          hydrate: function(context, locals, directives) {
            this.mode = ChangeDetectionUtil.changeDetectionMode(this.changeControlStrategy);
            this.values[0] = context;
            this.locals = locals;
            this.directives = directives;
          },
          dehydrate: function() {
            this._destroyPipes();
            ListWrapper.fill(this.values, uninitialized);
            ListWrapper.fill(this.changes, false);
            ListWrapper.fill(this.pipes, null);
            ListWrapper.fill(this.prevContexts, uninitialized);
            this.locals = null;
          },
          _destroyPipes: function() {
            for (var i = 0; i < this.pipes.length; ++i) {
              if (isPresent(this.pipes[i])) {
                this.pipes[i].onDestroy();
              }
            }
          },
          hydrated: function() {
            return this.values[0] !== uninitialized;
          },
          detectChangesInRecords: function(throwOnChange) {
            var protos = this.protos;
            var changes = null;
            var isChanged = false;
            for (var i = 0; i < protos.length; ++i) {
              var proto = protos[i];
              var bindingRecord = proto.bindingRecord;
              var directiveRecord = bindingRecord.directiveRecord;
              var change = this._check(proto, throwOnChange);
              if (isPresent(change)) {
                this._updateDirectiveOrElement(change, bindingRecord);
                isChanged = true;
                changes = this._addChange(bindingRecord, change, changes);
              }
              if (proto.lastInDirective) {
                if (isPresent(changes)) {
                  this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
                  changes = null;
                }
                if (isChanged && bindingRecord.isOnPushChangeDetection()) {
                  this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
                }
                isChanged = false;
              }
            }
          },
          callOnAllChangesDone: function() {
            var dirs = this.directiveRecords;
            for (var i = dirs.length - 1; i >= 0; --i) {
              var dir = dirs[i];
              if (dir.callOnAllChangesDone) {
                this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
              }
            }
          },
          _updateDirectiveOrElement: function(change, bindingRecord) {
            if (isBlank(bindingRecord.directiveRecord)) {
              this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
            } else {
              var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
              bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
            }
          },
          _addChange: function(bindingRecord, change, changes) {
            if (bindingRecord.callOnChange()) {
              return ChangeDetectionUtil.addChange(changes, bindingRecord.propertyName, change);
            } else {
              return changes;
            }
          },
          _getDirectiveFor: function(directiveIndex) {
            return this.directives.getDirectiveFor(directiveIndex);
          },
          _getDetectorFor: function(directiveIndex) {
            return this.directives.getDetectorFor(directiveIndex);
          },
          _check: function(proto, throwOnChange) {
            try {
              if (proto.mode === RECORD_TYPE_PIPE || proto.mode === RECORD_TYPE_BINDING_PIPE) {
                return this._pipeCheck(proto, throwOnChange);
              } else {
                return this._referenceCheck(proto, throwOnChange);
              }
            } catch (e) {
              throw new ChangeDetectionError(proto, e);
            }
          },
          _referenceCheck: function(proto, throwOnChange) {
            if (this._pureFuncAndArgsDidNotChange(proto)) {
              this._setChanged(proto, false);
              return null;
            }
            var prevValue = this._readSelf(proto);
            var currValue = this._calculateCurrValue(proto);
            if (!isSame(prevValue, currValue)) {
              if (proto.lastInBinding) {
                var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                  ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
              } else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
              }
            } else {
              this._setChanged(proto, false);
              return null;
            }
          },
          _calculateCurrValue: function(proto) {
            switch (proto.mode) {
              case RECORD_TYPE_SELF:
                return this._readContext(proto);
              case RECORD_TYPE_CONST:
                return proto.funcOrValue;
              case RECORD_TYPE_PROPERTY:
                var context = this._readContext(proto);
                return proto.funcOrValue(context);
              case RECORD_TYPE_LOCAL:
                return this.locals.get(proto.name);
              case RECORD_TYPE_INVOKE_METHOD:
                var context = this._readContext(proto);
                var args = this._readArgs(proto);
                return proto.funcOrValue(context, args);
              case RECORD_TYPE_KEYED_ACCESS:
                var arg = this._readArgs(proto)[0];
                return this._readContext(proto)[arg];
              case RECORD_TYPE_INVOKE_CLOSURE:
                return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));
              case RECORD_TYPE_INTERPOLATE:
              case RECORD_TYPE_PRIMITIVE_OP:
                return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));
              default:
                throw new BaseException(("Unknown operation " + proto.mode));
            }
          },
          _pipeCheck: function(proto, throwOnChange) {
            var context = this._readContext(proto);
            var pipe = this._pipeFor(proto, context);
            var prevValue = this._readSelf(proto);
            var currValue = pipe.transform(context);
            if (!isSame(prevValue, currValue)) {
              currValue = ChangeDetectionUtil.unwrapValue(currValue);
              if (proto.lastInBinding) {
                var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                  ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
              } else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
              }
            } else {
              this._setChanged(proto, false);
              return null;
            }
          },
          _pipeFor: function(proto, context) {
            var storedPipe = this._readPipe(proto);
            if (isPresent(storedPipe) && storedPipe.supports(context)) {
              return storedPipe;
            }
            if (isPresent(storedPipe)) {
              storedPipe.onDestroy();
            }
            var cdr = proto.mode === RECORD_TYPE_BINDING_PIPE ? this.ref : null;
            var pipe = this.pipeRegistry.get(proto.name, context, cdr);
            this._writePipe(proto, pipe);
            return pipe;
          },
          _readContext: function(proto) {
            if (proto.contextIndex == -1) {
              return this._getDirectiveFor(proto.directiveIndex);
            } else {
              return this.values[proto.contextIndex];
            }
            return this.values[proto.contextIndex];
          },
          _readSelf: function(proto) {
            return this.values[proto.selfIndex];
          },
          _writeSelf: function(proto, value) {
            this.values[proto.selfIndex] = value;
          },
          _readPipe: function(proto) {
            return this.pipes[proto.selfIndex];
          },
          _writePipe: function(proto, value) {
            this.pipes[proto.selfIndex] = value;
          },
          _setChanged: function(proto, value) {
            this.changes[proto.selfIndex] = value;
          },
          _pureFuncAndArgsDidNotChange: function(proto) {
            return proto.isPureFunction() && !this._argsChanged(proto);
          },
          _argsChanged: function(proto) {
            var args = proto.args;
            for (var i = 0; i < args.length; ++i) {
              if (this.changes[args[i]]) {
                return true;
              }
            }
            return false;
          },
          _readArgs: function(proto) {
            var res = ListWrapper.createFixedSize(proto.args.length);
            var args = proto.args;
            for (var i = 0; i < args.length; ++i) {
              res[i] = this.values[args[i]];
            }
            return res;
          }
        }, {}, $__super);
      }(AbstractChangeDetector));
      $__export("DynamicChangeDetector", DynamicChangeDetector);
    }
  };
});

System.register("angular2/src/change_detection/pipes/observable_pipe", ["angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/change_detection/pipes/pipe"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/pipes/observable_pipe";
  var __decorate,
      __metadata,
      ObservableWrapper,
      isBlank,
      isPresent,
      CONST,
      Pipe,
      WrappedValue,
      PipeFactory,
      ObservablePipe,
      ObservablePipeFactory;
  return {
    setters: [function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      CONST = $__m.CONST;
    }, function($__m) {
      Pipe = $__m.Pipe;
      WrappedValue = $__m.WrappedValue;
      PipeFactory = $__m.PipeFactory;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      ObservablePipe = (function($__super) {
        function ObservablePipe(ref) {
          $traceurRuntime.superConstructor(ObservablePipe).call(this);
          this._ref = ref;
          this._latestValue = null;
          this._latestReturnedValue = null;
          this._subscription = null;
          this._observable = null;
        }
        return ($traceurRuntime.createClass)(ObservablePipe, {
          supports: function(obs) {
            return ObservableWrapper.isObservable(obs);
          },
          onDestroy: function() {
            if (isPresent(this._subscription)) {
              this._dispose();
            }
          },
          transform: function(obs) {
            if (isBlank(this._subscription)) {
              this._subscribe(obs);
              return null;
            }
            if (obs !== this._observable) {
              this._dispose();
              return this.transform(obs);
            }
            if (this._latestValue === this._latestReturnedValue) {
              return this._latestReturnedValue;
            } else {
              this._latestReturnedValue = this._latestValue;
              return WrappedValue.wrap(this._latestValue);
            }
          },
          _subscribe: function(obs) {
            var $__0 = this;
            this._observable = obs;
            this._subscription = ObservableWrapper.subscribe(obs, (function(value) {
              $__0._updateLatestValue(value);
            }), (function(e) {
              throw e;
            }));
          },
          _dispose: function() {
            ObservableWrapper.dispose(this._subscription);
            this._latestValue = null;
            this._latestReturnedValue = null;
            this._subscription = null;
            this._observable = null;
          },
          _updateLatestValue: function(value) {
            this._latestValue = value;
            this._ref.requestCheck();
          }
        }, {}, $__super);
      }(Pipe));
      $__export("ObservablePipe", ObservablePipe);
      ObservablePipeFactory = (function($__super) {
        function $__1() {
          $traceurRuntime.superConstructor($__1).call(this);
        }
        return ($traceurRuntime.createClass)($__1, {
          supports: function(obs) {
            return ObservableWrapper.isObservable(obs);
          },
          create: function(cdRef) {
            return new ObservablePipe(cdRef);
          }
        }, {}, $__super);
      }(PipeFactory));
      $__export("ObservablePipeFactory", ObservablePipeFactory);
      $__export("ObservablePipeFactory", ObservablePipeFactory = __decorate([CONST(), __metadata('design:paramtypes', [])], ObservablePipeFactory));
    }
  };
});

System.register("angular2/src/di/binding", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/reflection/reflection", "angular2/src/di/key", "angular2/src/di/annotations_impl", "angular2/src/di/exceptions", "angular2/src/di/forward_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/binding";
  var __decorate,
      __metadata,
      Type,
      isBlank,
      isPresent,
      CONST,
      ListWrapper,
      reflector,
      Key,
      Inject,
      InjectLazy,
      InjectPromise,
      Optional,
      DependencyAnnotation,
      NoAnnotationError,
      resolveForwardRef,
      Dependency,
      _EMPTY_LIST,
      Binding,
      ResolvedBinding,
      BindingBuilder;
  function bind(token) {
    return new BindingBuilder(token);
  }
  function _constructDependencies(factoryFunction, dependencies) {
    return isBlank(dependencies) ? _dependenciesFor(factoryFunction) : ListWrapper.map(dependencies, (function(t) {
      return _extractToken(factoryFunction, t);
    }));
  }
  function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
      return [];
    if (ListWrapper.any(params, (function(p) {
      return isBlank(p);
    }))) {
      throw new NoAnnotationError(typeOrFunc);
    }
    return ListWrapper.map(params, (function(p) {
      return _extractToken(typeOrFunc, p);
    }));
  }
  function _extractToken(typeOrFunc, annotations) {
    var depProps = [];
    var token = null;
    var optional = false;
    var lazy = false;
    var asPromise = false;
    if (!ListWrapper.isList(annotations)) {
      return _createDependency(annotations, asPromise, lazy, optional, depProps);
    }
    for (var i = 0; i < annotations.length; ++i) {
      var paramAnnotation = annotations[i];
      if (paramAnnotation instanceof Type) {
        token = paramAnnotation;
      } else if (paramAnnotation instanceof Inject) {
        token = paramAnnotation.token;
      } else if (paramAnnotation instanceof InjectPromise) {
        token = paramAnnotation.token;
        asPromise = true;
      } else if (paramAnnotation instanceof InjectLazy) {
        token = paramAnnotation.token;
        lazy = true;
      } else if (paramAnnotation instanceof Optional) {
        optional = true;
      } else if (paramAnnotation instanceof DependencyAnnotation) {
        if (isPresent(paramAnnotation.token)) {
          token = paramAnnotation.token;
        }
        ListWrapper.push(depProps, paramAnnotation);
      }
    }
    token = resolveForwardRef(token);
    if (isPresent(token)) {
      return _createDependency(token, asPromise, lazy, optional, depProps);
    } else {
      throw new NoAnnotationError(typeOrFunc);
    }
  }
  function _createDependency(token, asPromise, lazy, optional, depProps) {
    return new Dependency(Key.get(token), asPromise, lazy, optional, depProps);
  }
  $__export("bind", bind);
  return {
    setters: [function($__m) {
      Type = $__m.Type;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      CONST = $__m.CONST;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      Key = $__m.Key;
    }, function($__m) {
      Inject = $__m.Inject;
      InjectLazy = $__m.InjectLazy;
      InjectPromise = $__m.InjectPromise;
      Optional = $__m.Optional;
      DependencyAnnotation = $__m.DependencyAnnotation;
    }, function($__m) {
      NoAnnotationError = $__m.NoAnnotationError;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      Dependency = (function() {
        function Dependency(key, asPromise, lazy, optional, properties) {
          this.key = key;
          this.asPromise = asPromise;
          this.lazy = lazy;
          this.optional = optional;
          this.properties = properties;
        }
        return ($traceurRuntime.createClass)(Dependency, {}, {fromKey: function(key) {
            return new Dependency(key, false, false, false, []);
          }});
      }());
      $__export("Dependency", Dependency);
      _EMPTY_LIST = [];
      Binding = (($traceurRuntime.createClass)(function(token, $__3) {
        var $__4 = $__3,
            toClass = $__4.toClass,
            toValue = $__4.toValue,
            toAlias = $__4.toAlias,
            toFactory = $__4.toFactory,
            toAsyncFactory = $__4.toAsyncFactory,
            deps = $__4.deps;
        this.token = token;
        this.toClass = toClass;
        this.toValue = toValue;
        this.toAlias = toAlias;
        this.toFactory = toFactory;
        this.toAsyncFactory = toAsyncFactory;
        this.dependencies = deps;
      }, {resolve: function() {
          var $__0 = this;
          var factoryFn;
          var resolvedDeps;
          var isAsync = false;
          if (isPresent(this.toClass)) {
            var toClass = resolveForwardRef(this.toClass);
            factoryFn = reflector.factory(toClass);
            resolvedDeps = _dependenciesFor(toClass);
          } else if (isPresent(this.toAlias)) {
            factoryFn = (function(aliasInstance) {
              return aliasInstance;
            });
            resolvedDeps = [Dependency.fromKey(Key.get(this.toAlias))];
          } else if (isPresent(this.toFactory)) {
            factoryFn = this.toFactory;
            resolvedDeps = _constructDependencies(this.toFactory, this.dependencies);
          } else if (isPresent(this.toAsyncFactory)) {
            factoryFn = this.toAsyncFactory;
            resolvedDeps = _constructDependencies(this.toAsyncFactory, this.dependencies);
            isAsync = true;
          } else {
            factoryFn = (function() {
              return $__0.toValue;
            });
            resolvedDeps = _EMPTY_LIST;
          }
          return new ResolvedBinding(Key.get(this.token), factoryFn, resolvedDeps, isAsync);
        }}, {}));
      $__export("Binding", Binding);
      $__export("Binding", Binding = __decorate([CONST(), __metadata('design:paramtypes', [Object, Object])], Binding));
      ResolvedBinding = (function() {
        function ResolvedBinding(key, factory, dependencies, providedAsPromise) {
          this.key = key;
          this.factory = factory;
          this.dependencies = dependencies;
          this.providedAsPromise = providedAsPromise;
        }
        return ($traceurRuntime.createClass)(ResolvedBinding, {}, {});
      }());
      $__export("ResolvedBinding", ResolvedBinding);
      BindingBuilder = (function() {
        function BindingBuilder(token) {
          this.token = token;
        }
        return ($traceurRuntime.createClass)(BindingBuilder, {
          toClass: function(type) {
            return new Binding(this.token, {toClass: type});
          },
          toValue: function(value) {
            return new Binding(this.token, {toValue: value});
          },
          toAlias: function(aliasToken) {
            return new Binding(this.token, {toAlias: aliasToken});
          },
          toFactory: function(factoryFunction, dependencies) {
            return new Binding(this.token, {
              toFactory: factoryFunction,
              deps: dependencies
            });
          },
          toAsyncFactory: function(factoryFunction, dependencies) {
            return new Binding(this.token, {
              toAsyncFactory: factoryFunction,
              deps: dependencies
            });
          }
        }, {});
      }());
      $__export("BindingBuilder", BindingBuilder);
    }
  };
});

System.register("angular2/src/core/compiler/view_manager_utils", ["angular2/di", "angular2/src/facade/collection", "angular2/src/core/compiler/element_injector", "angular2/src/facade/lang", "angular2/src/core/compiler/view", "angular2/src/core/compiler/directive_resolver"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_manager_utils";
  var __decorate,
      __metadata,
      Injectable,
      ListWrapper,
      eli,
      isPresent,
      isBlank,
      BaseException,
      viewModule,
      DirectiveResolver,
      AppViewManagerUtils;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      eli = $__m;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      viewModule = $__m;
    }, function($__m) {
      DirectiveResolver = $__m.DirectiveResolver;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppViewManagerUtils = (($traceurRuntime.createClass)(function(metadataReader) {
        this._directiveResolver = metadataReader;
      }, {
        getComponentInstance: function(parentView, boundElementIndex) {
          var binder = parentView.proto.elementBinders[boundElementIndex];
          var eli = parentView.elementInjectors[boundElementIndex];
          if (binder.hasDynamicComponent()) {
            return eli.getDynamicallyLoadedComponent();
          } else {
            return eli.getComponent();
          }
        },
        createView: function(protoView, renderView, viewManager, renderer) {
          var view = new viewModule.AppView(renderer, protoView, protoView.protoLocals);
          view.render = renderView;
          var changeDetector = protoView.protoChangeDetector.instantiate(view);
          var binders = protoView.elementBinders;
          var elementInjectors = ListWrapper.createFixedSize(binders.length);
          var rootElementInjectors = [];
          var preBuiltObjects = ListWrapper.createFixedSize(binders.length);
          var componentChildViews = ListWrapper.createFixedSize(binders.length);
          for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            var elementInjector = null;
            var protoElementInjector = binder.protoElementInjector;
            if (isPresent(protoElementInjector)) {
              if (isPresent(protoElementInjector.parent)) {
                var parentElementInjector = elementInjectors[protoElementInjector.parent.index];
                elementInjector = protoElementInjector.instantiate(parentElementInjector);
              } else {
                elementInjector = protoElementInjector.instantiate(null);
                ListWrapper.push(rootElementInjectors, elementInjector);
              }
            }
            elementInjectors[binderIdx] = elementInjector;
            if (isPresent(elementInjector)) {
              var embeddedProtoView = binder.hasEmbeddedProtoView() ? binder.nestedProtoView : null;
              preBuiltObjects[binderIdx] = new eli.PreBuiltObjects(viewManager, view, embeddedProtoView);
            }
          }
          view.init(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, componentChildViews);
          return view;
        },
        attachComponentView: function(hostView, boundElementIndex, componentView) {
          var childChangeDetector = componentView.changeDetector;
          hostView.changeDetector.addShadowDomChild(childChangeDetector);
          hostView.componentChildViews[boundElementIndex] = componentView;
        },
        detachComponentView: function(hostView, boundElementIndex) {
          var componentView = hostView.componentChildViews[boundElementIndex];
          hostView.changeDetector.removeShadowDomChild(componentView.changeDetector);
          hostView.componentChildViews[boundElementIndex] = null;
        },
        hydrateComponentView: function(hostView, boundElementIndex) {
          var injector = arguments[2] !== (void 0) ? arguments[2] : null;
          var elementInjector = hostView.elementInjectors[boundElementIndex];
          var componentView = hostView.componentChildViews[boundElementIndex];
          var component = this.getComponentInstance(hostView, boundElementIndex);
          this._hydrateView(componentView, injector, elementInjector, component, null);
        },
        hydrateRootHostView: function(hostView) {
          var injector = arguments[1] !== (void 0) ? arguments[1] : null;
          this._hydrateView(hostView, injector, null, new Object(), null);
        },
        attachAndHydrateFreeHostView: function(parentComponentHostView, parentComponentBoundElementIndex, hostView) {
          var injector = arguments[3] !== (void 0) ? arguments[3] : null;
          var hostElementInjector = parentComponentHostView.elementInjectors[parentComponentBoundElementIndex];
          var parentView = parentComponentHostView.componentChildViews[parentComponentBoundElementIndex];
          parentView.changeDetector.addChild(hostView.changeDetector);
          ListWrapper.push(parentView.freeHostViews, hostView);
          this._hydrateView(hostView, injector, hostElementInjector, new Object(), null);
        },
        detachFreeHostView: function(parentView, hostView) {
          parentView.changeDetector.removeChild(hostView.changeDetector);
          ListWrapper.remove(parentView.freeHostViews, hostView);
        },
        attachViewInContainer: function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view) {
          if (isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
          }
          parentView.changeDetector.addChild(view.changeDetector);
          var viewContainer = parentView.viewContainers[boundElementIndex];
          if (isBlank(viewContainer)) {
            viewContainer = new viewModule.AppViewContainer();
            parentView.viewContainers[boundElementIndex] = viewContainer;
          }
          ListWrapper.insert(viewContainer.views, atIndex, view);
          var sibling;
          if (atIndex == 0) {
            sibling = null;
          } else {
            sibling = ListWrapper.last(viewContainer.views[atIndex - 1].rootElementInjectors);
          }
          var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
          for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
            view.rootElementInjectors[i].linkAfter(elementInjector, sibling);
          }
        },
        detachViewInContainer: function(parentView, boundElementIndex, atIndex) {
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          view.changeDetector.remove();
          ListWrapper.removeAt(viewContainer.views, atIndex);
          for (var i = 0; i < view.rootElementInjectors.length; ++i) {
            view.rootElementInjectors[i].unlink();
          }
        },
        hydrateViewInContainer: function(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, injector) {
          if (isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
          }
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          var elementInjector = contextView.elementInjectors[contextBoundElementIndex].getHost();
          this._hydrateView(view, injector, elementInjector, contextView.context, contextView.locals);
        },
        hydrateDynamicComponentInElementInjector: function(hostView, boundElementIndex, componentBinding) {
          var injector = arguments[3] !== (void 0) ? arguments[3] : null;
          var elementInjector = hostView.elementInjectors[boundElementIndex];
          if (isPresent(elementInjector.getDynamicallyLoadedComponent())) {
            throw new BaseException(("There already is a dynamic component loaded at element " + boundElementIndex));
          }
          if (isBlank(injector)) {
            injector = elementInjector.getLightDomAppInjector();
          }
          var annotation = this._directiveResolver.resolve(componentBinding.token);
          var componentDirective = eli.DirectiveBinding.createFromBinding(componentBinding, annotation);
          elementInjector.dynamicallyCreateComponent(componentDirective, injector);
        },
        _hydrateView: function(view, appInjector, hostElementInjector, context, parentLocals) {
          if (isBlank(appInjector)) {
            appInjector = hostElementInjector.getShadowDomAppInjector();
          }
          if (isBlank(appInjector)) {
            appInjector = hostElementInjector.getLightDomAppInjector();
          }
          view.context = context;
          view.locals.parent = parentLocals;
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            var elementInjector = view.elementInjectors[i];
            if (isPresent(elementInjector)) {
              elementInjector.hydrate(appInjector, hostElementInjector, view.preBuiltObjects[i]);
              this._setUpEventEmitters(view, elementInjector, i);
              this._setUpHostActions(view, elementInjector, i);
              var exportImplicitName = elementInjector.getExportImplicitName();
              if (elementInjector.isExportingComponent()) {
                view.locals.set(exportImplicitName, elementInjector.getComponent());
              } else if (elementInjector.isExportingElement()) {
                view.locals.set(exportImplicitName, elementInjector.getElementRef().domElement);
              }
            }
          }
          view.changeDetector.hydrate(view.context, view.locals, view);
        },
        _setUpEventEmitters: function(view, elementInjector, boundElementIndex) {
          var emitters = elementInjector.getEventEmitterAccessors();
          for (var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
            var directiveEmitters = emitters[directiveIndex];
            var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
            for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
              var eventEmitterAccessor = directiveEmitters[eventIndex];
              eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
            }
          }
        },
        _setUpHostActions: function(view, elementInjector, boundElementIndex) {
          var hostActions = elementInjector.getHostActionAccessors();
          for (var directiveIndex = 0; directiveIndex < hostActions.length; ++directiveIndex) {
            var directiveHostActions = hostActions[directiveIndex];
            var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
            for (var index = 0; index < directiveHostActions.length; ++index) {
              var hostActionAccessor = directiveHostActions[index];
              hostActionAccessor.subscribe(view, boundElementIndex, directive);
            }
          }
        },
        dehydrateView: function(view) {
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            var elementInjector = view.elementInjectors[i];
            if (isPresent(elementInjector)) {
              elementInjector.dehydrate();
            }
          }
          if (isPresent(view.locals)) {
            view.locals.clearValues();
          }
          view.context = null;
          view.changeDetector.dehydrate();
        }
      }, {}));
      $__export("AppViewManagerUtils", AppViewManagerUtils);
      $__export("AppViewManagerUtils", AppViewManagerUtils = __decorate([Injectable(), __metadata('design:paramtypes', [DirectiveResolver])], AppViewManagerUtils));
    }
  };
});

System.register("angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", ["angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/light_dom", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/util"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy";
  var DOM,
      LightDom,
      ShadowDomStrategy,
      insertSharedStyleText,
      EmulatedUnscopedShadowDomStrategy;
  return {
    setters: [function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      LightDom = $__m.LightDom;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      insertSharedStyleText = $__m.insertSharedStyleText;
    }],
    execute: function() {
      EmulatedUnscopedShadowDomStrategy = (function($__super) {
        function EmulatedUnscopedShadowDomStrategy(styleUrlResolver, styleHost) {
          $traceurRuntime.superConstructor(EmulatedUnscopedShadowDomStrategy).call(this);
          this.styleUrlResolver = styleUrlResolver;
          this.styleHost = styleHost;
        }
        return ($traceurRuntime.createClass)(EmulatedUnscopedShadowDomStrategy, {
          hasNativeContentElement: function() {
            return false;
          },
          prepareShadowRoot: function(el) {
            return el;
          },
          constructLightDom: function(lightDomView, el) {
            return new LightDom(lightDomView, el);
          },
          processStyleElement: function(hostComponentId, templateUrl, styleEl) {
            var cssText = DOM.getText(styleEl);
            cssText = this.styleUrlResolver.resolveUrls(cssText, templateUrl);
            DOM.setText(styleEl, cssText);
            DOM.remove(styleEl);
            insertSharedStyleText(cssText, this.styleHost, styleEl);
            return null;
          }
        }, {}, $__super);
      }(ShadowDomStrategy));
      $__export("EmulatedUnscopedShadowDomStrategy", EmulatedUnscopedShadowDomStrategy);
    }
  };
});

System.register("angular2/src/render/dom/dom_renderer", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/shadow_dom/content_tag", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/events/event_manager", "angular2/src/render/dom/view/proto_view", "angular2/src/render/dom/view/view", "angular2/src/render/dom/view/view_container", "angular2/src/render/dom/util", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/dom_renderer";
  var __decorate,
      __metadata,
      __param,
      Inject,
      Injectable,
      isPresent,
      isBlank,
      BaseException,
      ListWrapper,
      DOM,
      Content,
      ShadowDomStrategy,
      EventManager,
      resolveInternalDomProtoView,
      DomView,
      DomViewRef,
      resolveInternalDomView,
      DomViewContainer,
      NG_BINDING_CLASS_SELECTOR,
      NG_BINDING_CLASS,
      Renderer,
      DOCUMENT_TOKEN,
      DomRenderer;
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Content = $__m.Content;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      EventManager = $__m.EventManager;
    }, function($__m) {
      resolveInternalDomProtoView = $__m.resolveInternalDomProtoView;
    }, function($__m) {
      DomView = $__m.DomView;
      DomViewRef = $__m.DomViewRef;
      resolveInternalDomView = $__m.resolveInternalDomView;
    }, function($__m) {
      DomViewContainer = $__m.DomViewContainer;
    }, function($__m) {
      NG_BINDING_CLASS_SELECTOR = $__m.NG_BINDING_CLASS_SELECTOR;
      NG_BINDING_CLASS = $__m.NG_BINDING_CLASS;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      __param = (this && this.__param) || function(paramIndex, decorator) {
        return function(target, key) {
          decorator(target, key, paramIndex);
        };
      };
      DOCUMENT_TOKEN = 'DocumentToken';
      $__export("DOCUMENT_TOKEN", DOCUMENT_TOKEN);
      DomRenderer = (function($__super) {
        function $__0(eventManager, shadowDomStrategy, document) {
          $traceurRuntime.superConstructor($__0).call(this);
          this._eventManager = eventManager;
          this._shadowDomStrategy = shadowDomStrategy;
          this._document = document;
        }
        return ($traceurRuntime.createClass)($__0, {
          createRootHostView: function(hostProtoViewRef, hostElementSelector) {
            var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
            var element = DOM.querySelector(this._document, hostElementSelector);
            if (isBlank(element)) {
              throw new BaseException(("The selector \"" + hostElementSelector + "\" did not match any elements"));
            }
            return new DomViewRef(this._createView(hostProtoView, element));
          },
          detachFreeHostView: function(parentHostViewRef, hostViewRef) {
            var hostView = resolveInternalDomView(hostViewRef);
            this._removeViewNodes(hostView);
          },
          createView: function(protoViewRef) {
            var protoView = resolveInternalDomProtoView(protoViewRef);
            return new DomViewRef(this._createView(protoView, null));
          },
          destroyView: function(view) {},
          attachComponentView: function(hostViewRef, elementIndex, componentViewRef) {
            var hostView = resolveInternalDomView(hostViewRef);
            var componentView = resolveInternalDomView(componentViewRef);
            var element = hostView.boundElements[elementIndex];
            var lightDom = hostView.lightDoms[elementIndex];
            if (isPresent(lightDom)) {
              lightDom.attachShadowDomView(componentView);
            }
            var shadowRoot = this._shadowDomStrategy.prepareShadowRoot(element);
            this._moveViewNodesIntoParent(shadowRoot, componentView);
            componentView.hostLightDom = lightDom;
            componentView.shadowRoot = shadowRoot;
          },
          setComponentViewRootNodes: function(componentViewRef, rootNodes) {
            var componentView = resolveInternalDomView(componentViewRef);
            this._removeViewNodes(componentView);
            componentView.rootNodes = rootNodes;
            this._moveViewNodesIntoParent(componentView.shadowRoot, componentView);
          },
          getHostElement: function(hostViewRef) {
            var hostView = resolveInternalDomView(hostViewRef);
            return hostView.boundElements[0];
          },
          detachComponentView: function(hostViewRef, boundElementIndex, componentViewRef) {
            var hostView = resolveInternalDomView(hostViewRef);
            var componentView = resolveInternalDomView(componentViewRef);
            this._removeViewNodes(componentView);
            var lightDom = hostView.lightDoms[boundElementIndex];
            if (isPresent(lightDom)) {
              lightDom.detachShadowDomView();
            }
            componentView.hostLightDom = null;
            componentView.shadowRoot = null;
          },
          attachViewInContainer: function(parentViewRef, boundElementIndex, atIndex, viewRef) {
            var parentView = resolveInternalDomView(parentViewRef);
            var view = resolveInternalDomView(viewRef);
            var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
            ListWrapper.insert(viewContainer.views, atIndex, view);
            view.hostLightDom = parentView.hostLightDom;
            var directParentLightDom = parentView.getDirectParentLightDom(boundElementIndex);
            if (isBlank(directParentLightDom)) {
              var siblingToInsertAfter;
              if (atIndex == 0) {
                siblingToInsertAfter = parentView.boundElements[boundElementIndex];
              } else {
                siblingToInsertAfter = ListWrapper.last(viewContainer.views[atIndex - 1].rootNodes);
              }
              this._moveViewNodesAfterSibling(siblingToInsertAfter, view);
            } else {
              directParentLightDom.redistribute();
            }
            if (isPresent(parentView.hostLightDom)) {
              parentView.hostLightDom.redistribute();
            }
          },
          detachViewInContainer: function(parentViewRef, boundElementIndex, atIndex, viewRef) {
            var parentView = resolveInternalDomView(parentViewRef);
            var view = resolveInternalDomView(viewRef);
            var viewContainer = parentView.viewContainers[boundElementIndex];
            var detachedView = viewContainer.views[atIndex];
            ListWrapper.removeAt(viewContainer.views, atIndex);
            var directParentLightDom = parentView.getDirectParentLightDom(boundElementIndex);
            if (isBlank(directParentLightDom)) {
              this._removeViewNodes(detachedView);
            } else {
              directParentLightDom.redistribute();
            }
            view.hostLightDom = null;
            if (isPresent(parentView.hostLightDom)) {
              parentView.hostLightDom.redistribute();
            }
          },
          hydrateView: function(viewRef) {
            var view = resolveInternalDomView(viewRef);
            if (view.hydrated)
              throw new BaseException('The view is already hydrated.');
            view.hydrated = true;
            for (var i = 0; i < view.lightDoms.length; ++i) {
              var lightDom = view.lightDoms[i];
              if (isPresent(lightDom)) {
                lightDom.redistribute();
              }
            }
            view.eventHandlerRemovers = ListWrapper.create();
            var binders = view.proto.elementBinders;
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              if (isPresent(binder.globalEvents)) {
                for (var i = 0; i < binder.globalEvents.length; i++) {
                  var globalEvent = binder.globalEvents[i];
                  var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
                  ListWrapper.push(view.eventHandlerRemovers, remover);
                }
              }
            }
            if (isPresent(view.hostLightDom)) {
              view.hostLightDom.redistribute();
            }
          },
          dehydrateView: function(viewRef) {
            var view = resolveInternalDomView(viewRef);
            for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
              view.eventHandlerRemovers[i]();
            }
            view.eventHandlerRemovers = null;
            view.hydrated = false;
          },
          setElementProperty: function(viewRef, elementIndex, propertyName, propertyValue) {
            var view = resolveInternalDomView(viewRef);
            view.setElementProperty(elementIndex, propertyName, propertyValue);
          },
          callAction: function(viewRef, elementIndex, actionExpression, actionArgs) {
            var view = resolveInternalDomView(viewRef);
            view.callAction(elementIndex, actionExpression, actionArgs);
          },
          setText: function(viewRef, textNodeIndex, text) {
            var view = resolveInternalDomView(viewRef);
            DOM.setText(view.boundTextNodes[textNodeIndex], text);
          },
          setEventDispatcher: function(viewRef, dispatcher) {
            var view = resolveInternalDomView(viewRef);
            view.eventDispatcher = dispatcher;
          },
          _createView: function(protoView, inplaceElement) {
            var rootElementClone = isPresent(inplaceElement) ? inplaceElement : DOM.importIntoDoc(protoView.element);
            var elementsWithBindingsDynamic;
            if (protoView.isTemplateElement) {
              elementsWithBindingsDynamic = DOM.querySelectorAll(DOM.content(rootElementClone), NG_BINDING_CLASS_SELECTOR);
            } else {
              elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
            }
            var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
            for (var binderIdx = 0; binderIdx < elementsWithBindingsDynamic.length; ++binderIdx) {
              elementsWithBindings[binderIdx] = elementsWithBindingsDynamic[binderIdx];
            }
            var viewRootNodes;
            if (protoView.isTemplateElement) {
              var childNode = DOM.firstChild(DOM.content(rootElementClone));
              viewRootNodes = [];
              while (childNode != null) {
                ListWrapper.push(viewRootNodes, childNode);
                childNode = DOM.nextSibling(childNode);
              }
            } else {
              viewRootNodes = [rootElementClone];
            }
            var binders = protoView.elementBinders;
            var boundTextNodes = [];
            var boundElements = ListWrapper.createFixedSize(binders.length);
            var contentTags = ListWrapper.createFixedSize(binders.length);
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              var element = void 0;
              if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
                element = rootElementClone;
              } else {
                element = elementsWithBindings[binderIdx - protoView.rootBindingOffset];
              }
              boundElements[binderIdx] = element;
              var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
              var textNodeIndices = binder.textNodeIndices;
              for (var i = 0; i < textNodeIndices.length; i++) {
                ListWrapper.push(boundTextNodes, childNodes[textNodeIndices[i]]);
              }
              var contentTag = null;
              if (isPresent(binder.contentTagSelector)) {
                contentTag = new Content(element, binder.contentTagSelector);
              }
              contentTags[binderIdx] = contentTag;
            }
            var view = new DomView(protoView, viewRootNodes, boundTextNodes, boundElements, contentTags);
            for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
              var binder = binders[binderIdx];
              var element = boundElements[binderIdx];
              var lightDom = null;
              if (isPresent(binder.componentId)) {
                lightDom = this._shadowDomStrategy.constructLightDom(view, boundElements[binderIdx]);
              }
              view.lightDoms[binderIdx] = lightDom;
              var contentTag = contentTags[binderIdx];
              if (isPresent(contentTag)) {
                var destLightDom = view.getDirectParentLightDom(binderIdx);
                contentTag.init(destLightDom);
              }
              if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
                for (var i = 0; i < binder.localEvents.length; i++) {
                  this._createEventListener(view, element, binderIdx, binder.localEvents[i].name, binder.eventLocals);
                }
              }
            }
            return view;
          },
          _createEventListener: function(view, element, elementIndex, eventName, eventLocals) {
            this._eventManager.addEventListener(element, eventName, (function(event) {
              view.dispatchEvent(elementIndex, eventName, event);
            }));
          },
          _moveViewNodesAfterSibling: function(sibling, view) {
            for (var i = view.rootNodes.length - 1; i >= 0; --i) {
              DOM.insertAfter(sibling, view.rootNodes[i]);
            }
          },
          _moveViewNodesIntoParent: function(parent, view) {
            for (var i = 0; i < view.rootNodes.length; ++i) {
              DOM.appendChild(parent, view.rootNodes[i]);
            }
          },
          _removeViewNodes: function(view) {
            var len = view.rootNodes.length;
            if (len == 0)
              return ;
            var parent = view.rootNodes[0].parentNode;
            for (var i = len - 1; i >= 0; --i) {
              DOM.removeChild(parent, view.rootNodes[i]);
            }
          },
          _getOrCreateViewContainer: function(parentView, boundElementIndex) {
            var vc = parentView.viewContainers[boundElementIndex];
            if (isBlank(vc)) {
              vc = new DomViewContainer();
              parentView.viewContainers[boundElementIndex] = vc;
            }
            return vc;
          },
          _createGlobalEventListener: function(view, elementIndex, eventName, eventTarget, fullName) {
            return this._eventManager.addGlobalEventListener(eventTarget, eventName, (function(event) {
              view.dispatchEvent(elementIndex, fullName, event);
            }));
          }
        }, {}, $__super);
      }(Renderer));
      $__export("DomRenderer", DomRenderer);
      $__export("DomRenderer", DomRenderer = __decorate([Injectable(), __param(2, Inject(DOCUMENT_TOKEN)), __metadata('design:paramtypes', [EventManager, ShadowDomStrategy, Object])], DomRenderer));
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_pipeline", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/dom/dom_adapter", "angular2/src/render/dom/compiler/compile_element", "angular2/src/render/dom/compiler/compile_control", "angular2/src/render/dom/view/proto_view_builder", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_pipeline";
  var isPresent,
      isBlank,
      ListWrapper,
      DOM,
      CompileElement,
      CompileControl,
      ProtoViewBuilder,
      ProtoViewDto,
      CompilePipeline;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      CompileElement = $__m.CompileElement;
    }, function($__m) {
      CompileControl = $__m.CompileControl;
    }, function($__m) {
      ProtoViewBuilder = $__m.ProtoViewBuilder;
    }, function($__m) {
      ProtoViewDto = $__m.ProtoViewDto;
    }],
    execute: function() {
      CompilePipeline = (function() {
        function CompilePipeline(steps) {
          this._control = new CompileControl(steps);
        }
        return ($traceurRuntime.createClass)(CompilePipeline, {
          process: function(rootElement) {
            var protoViewType = arguments[1] !== (void 0) ? arguments[1] : null;
            var compilationCtxtDescription = arguments[2] !== (void 0) ? arguments[2] : '';
            if (isBlank(protoViewType)) {
              protoViewType = ProtoViewDto.COMPONENT_VIEW_TYPE;
            }
            var results = ListWrapper.create();
            var rootCompileElement = new CompileElement(rootElement, compilationCtxtDescription);
            rootCompileElement.inheritedProtoView = new ProtoViewBuilder(rootElement, protoViewType);
            rootCompileElement.isViewRoot = true;
            this._process(results, null, rootCompileElement, compilationCtxtDescription);
            return results;
          },
          _process: function(results, parent, current) {
            var compilationCtxtDescription = arguments[3] !== (void 0) ? arguments[3] : '';
            var additionalChildren = this._control.internalProcess(results, 0, parent, current);
            if (current.compileChildren) {
              var node = DOM.firstChild(DOM.templateAwareRoot(current.element));
              while (isPresent(node)) {
                var nextNode = DOM.nextSibling(node);
                if (DOM.isElementNode(node)) {
                  var childCompileElement = new CompileElement(node, compilationCtxtDescription);
                  childCompileElement.inheritedProtoView = current.inheritedProtoView;
                  childCompileElement.inheritedElementBinder = current.inheritedElementBinder;
                  childCompileElement.distanceToInheritedBinder = current.distanceToInheritedBinder + 1;
                  this._process(results, current, childCompileElement);
                }
                node = nextNode;
              }
            }
            if (isPresent(additionalChildren)) {
              for (var i = 0; i < additionalChildren.length; i++) {
                this._process(results, current, additionalChildren[i]);
              }
            }
          }
        }, {});
      }());
      $__export("CompilePipeline", CompilePipeline);
    }
  };
});

System.register("angular2/src/render/dom/compiler/compile_step_factory", ["angular2/src/render/dom/compiler/property_binding_parser", "angular2/src/render/dom/compiler/text_interpolation_parser", "angular2/src/render/dom/compiler/directive_parser", "angular2/src/render/dom/compiler/view_splitter", "angular2/src/render/dom/shadow_dom/shadow_dom_compile_step"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compile_step_factory";
  var PropertyBindingParser,
      TextInterpolationParser,
      DirectiveParser,
      ViewSplitter,
      ShadowDomCompileStep,
      CompileStepFactory,
      DefaultStepFactory;
  return {
    setters: [function($__m) {
      PropertyBindingParser = $__m.PropertyBindingParser;
    }, function($__m) {
      TextInterpolationParser = $__m.TextInterpolationParser;
    }, function($__m) {
      DirectiveParser = $__m.DirectiveParser;
    }, function($__m) {
      ViewSplitter = $__m.ViewSplitter;
    }, function($__m) {
      ShadowDomCompileStep = $__m.ShadowDomCompileStep;
    }],
    execute: function() {
      CompileStepFactory = (function() {
        function CompileStepFactory() {}
        return ($traceurRuntime.createClass)(CompileStepFactory, {createSteps: function(template, subTaskPromises) {
            return null;
          }}, {});
      }());
      $__export("CompileStepFactory", CompileStepFactory);
      DefaultStepFactory = (function($__super) {
        function DefaultStepFactory(parser, shadowDomStrategy) {
          $traceurRuntime.superConstructor(DefaultStepFactory).call(this);
          this._parser = parser;
          this._shadowDomStrategy = shadowDomStrategy;
        }
        return ($traceurRuntime.createClass)(DefaultStepFactory, {createSteps: function(template, subTaskPromises) {
            return [new ViewSplitter(this._parser), new PropertyBindingParser(this._parser), new DirectiveParser(this._parser, template.directives), new TextInterpolationParser(this._parser), new ShadowDomCompileStep(this._shadowDomStrategy, template, subTaskPromises)];
          }}, {}, $__super);
      }(CompileStepFactory));
      $__export("DefaultStepFactory", DefaultStepFactory);
    }
  };
});

System.register("angular2/forms", ["angular2/src/forms/model", "angular2/src/forms/directives", "angular2/src/forms/validators", "angular2/src/forms/validator_directives", "angular2/src/forms/form_builder"], function($__export) {
  "use strict";
  var __moduleName = "angular2/forms";
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  var $__exportNames = {};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }],
    execute: function() {}
  };
});

System.register("angular2/src/change_detection/parser/lexer", ["angular2/src/di/decorators", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/lexer";
  var __decorate,
      __metadata,
      Injectable,
      ListWrapper,
      SetWrapper,
      NumberWrapper,
      StringJoiner,
      StringWrapper,
      BaseException,
      TOKEN_TYPE_CHARACTER,
      TOKEN_TYPE_IDENTIFIER,
      TOKEN_TYPE_KEYWORD,
      TOKEN_TYPE_STRING,
      TOKEN_TYPE_OPERATOR,
      TOKEN_TYPE_NUMBER,
      Lexer,
      Token,
      EOF,
      $EOF,
      $TAB,
      $LF,
      $VTAB,
      $FF,
      $CR,
      $SPACE,
      $BANG,
      $DQ,
      $HASH,
      $$,
      $PERCENT,
      $AMPERSAND,
      $SQ,
      $LPAREN,
      $RPAREN,
      $STAR,
      $PLUS,
      $COMMA,
      $MINUS,
      $PERIOD,
      $SLASH,
      $COLON,
      $SEMICOLON,
      $LT,
      $EQ,
      $GT,
      $QUESTION,
      $0,
      $9,
      $A,
      $E,
      $Z,
      $LBRACKET,
      $BACKSLASH,
      $RBRACKET,
      $CARET,
      $_,
      $a,
      $e,
      $f,
      $n,
      $r,
      $t,
      $u,
      $v,
      $z,
      $LBRACE,
      $BAR,
      $RBRACE,
      $NBSP,
      ScannerError,
      _Scanner,
      OPERATORS,
      KEYWORDS;
  function newCharacterToken(index, code) {
    return new Token(index, TOKEN_TYPE_CHARACTER, code, StringWrapper.fromCharCode(code));
  }
  function newIdentifierToken(index, text) {
    return new Token(index, TOKEN_TYPE_IDENTIFIER, 0, text);
  }
  function newKeywordToken(index, text) {
    return new Token(index, TOKEN_TYPE_KEYWORD, 0, text);
  }
  function newOperatorToken(index, text) {
    return new Token(index, TOKEN_TYPE_OPERATOR, 0, text);
  }
  function newStringToken(index, text) {
    return new Token(index, TOKEN_TYPE_STRING, 0, text);
  }
  function newNumberToken(index, n) {
    return new Token(index, TOKEN_TYPE_NUMBER, n, "");
  }
  function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
  }
  function isIdentifierStart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || (code == $_) || (code == $$);
  }
  function isIdentifierPart(code) {
    return ($a <= code && code <= $z) || ($A <= code && code <= $Z) || ($0 <= code && code <= $9) || (code == $_) || (code == $$);
  }
  function isDigit(code) {
    return $0 <= code && code <= $9;
  }
  function isExponentStart(code) {
    return code == $e || code == $E;
  }
  function isExponentSign(code) {
    return code == $MINUS || code == $PLUS;
  }
  function unescape(code) {
    switch (code) {
      case $n:
        return $LF;
      case $f:
        return $FF;
      case $r:
        return $CR;
      case $t:
        return $TAB;
      case $v:
        return $VTAB;
      default:
        return code;
    }
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      SetWrapper = $__m.SetWrapper;
    }, function($__m) {
      NumberWrapper = $__m.NumberWrapper;
      StringJoiner = $__m.StringJoiner;
      StringWrapper = $__m.StringWrapper;
      BaseException = $__m.BaseException;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      TOKEN_TYPE_CHARACTER = 1;
      $__export("TOKEN_TYPE_CHARACTER", TOKEN_TYPE_CHARACTER);
      TOKEN_TYPE_IDENTIFIER = 2;
      $__export("TOKEN_TYPE_IDENTIFIER", TOKEN_TYPE_IDENTIFIER);
      TOKEN_TYPE_KEYWORD = 3;
      $__export("TOKEN_TYPE_KEYWORD", TOKEN_TYPE_KEYWORD);
      TOKEN_TYPE_STRING = 4;
      $__export("TOKEN_TYPE_STRING", TOKEN_TYPE_STRING);
      TOKEN_TYPE_OPERATOR = 5;
      $__export("TOKEN_TYPE_OPERATOR", TOKEN_TYPE_OPERATOR);
      TOKEN_TYPE_NUMBER = 6;
      $__export("TOKEN_TYPE_NUMBER", TOKEN_TYPE_NUMBER);
      Lexer = (($traceurRuntime.createClass)(function() {}, {tokenize: function(text) {
          var scanner = new _Scanner(text);
          var tokens = [];
          var token = scanner.scanToken();
          while (token != null) {
            ListWrapper.push(tokens, token);
            token = scanner.scanToken();
          }
          return tokens;
        }}, {}));
      $__export("Lexer", Lexer);
      $__export("Lexer", Lexer = __decorate([Injectable(), __metadata('design:paramtypes', [])], Lexer));
      Token = (function() {
        function Token(index, type, numValue, strValue) {
          this.index = index;
          this.type = type;
          this.numValue = numValue;
          this.strValue = strValue;
        }
        return ($traceurRuntime.createClass)(Token, {
          isCharacter: function(code) {
            return (this.type == TOKEN_TYPE_CHARACTER && this.numValue == code);
          },
          isNumber: function() {
            return (this.type == TOKEN_TYPE_NUMBER);
          },
          isString: function() {
            return (this.type == TOKEN_TYPE_STRING);
          },
          isOperator: function(operater) {
            return (this.type == TOKEN_TYPE_OPERATOR && this.strValue == operater);
          },
          isIdentifier: function() {
            return (this.type == TOKEN_TYPE_IDENTIFIER);
          },
          isKeyword: function() {
            return (this.type == TOKEN_TYPE_KEYWORD);
          },
          isKeywordVar: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "var");
          },
          isKeywordNull: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "null");
          },
          isKeywordUndefined: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "undefined");
          },
          isKeywordTrue: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "true");
          },
          isKeywordFalse: function() {
            return (this.type == TOKEN_TYPE_KEYWORD && this.strValue == "false");
          },
          toNumber: function() {
            return (this.type == TOKEN_TYPE_NUMBER) ? this.numValue : -1;
          },
          toString: function() {
            var t = this.type;
            if (t >= TOKEN_TYPE_CHARACTER && t <= TOKEN_TYPE_STRING) {
              return this.strValue;
            } else if (t == TOKEN_TYPE_NUMBER) {
              return this.numValue.toString();
            } else {
              return null;
            }
          }
        }, {});
      }());
      $__export("Token", Token);
      EOF = new Token(-1, 0, 0, "");
      $__export("EOF", EOF);
      $EOF = 0;
      $__export("$EOF", $EOF);
      $TAB = 9;
      $__export("$TAB", $TAB);
      $LF = 10;
      $__export("$LF", $LF);
      $VTAB = 11;
      $__export("$VTAB", $VTAB);
      $FF = 12;
      $__export("$FF", $FF);
      $CR = 13;
      $__export("$CR", $CR);
      $SPACE = 32;
      $__export("$SPACE", $SPACE);
      $BANG = 33;
      $__export("$BANG", $BANG);
      $DQ = 34;
      $__export("$DQ", $DQ);
      $HASH = 35;
      $__export("$HASH", $HASH);
      $$ = 36;
      $__export("$$", $$);
      $PERCENT = 37;
      $__export("$PERCENT", $PERCENT);
      $AMPERSAND = 38;
      $__export("$AMPERSAND", $AMPERSAND);
      $SQ = 39;
      $__export("$SQ", $SQ);
      $LPAREN = 40;
      $__export("$LPAREN", $LPAREN);
      $RPAREN = 41;
      $__export("$RPAREN", $RPAREN);
      $STAR = 42;
      $__export("$STAR", $STAR);
      $PLUS = 43;
      $__export("$PLUS", $PLUS);
      $COMMA = 44;
      $__export("$COMMA", $COMMA);
      $MINUS = 45;
      $__export("$MINUS", $MINUS);
      $PERIOD = 46;
      $__export("$PERIOD", $PERIOD);
      $SLASH = 47;
      $__export("$SLASH", $SLASH);
      $COLON = 58;
      $__export("$COLON", $COLON);
      $SEMICOLON = 59;
      $__export("$SEMICOLON", $SEMICOLON);
      $LT = 60;
      $__export("$LT", $LT);
      $EQ = 61;
      $__export("$EQ", $EQ);
      $GT = 62;
      $__export("$GT", $GT);
      $QUESTION = 63;
      $__export("$QUESTION", $QUESTION);
      $0 = 48;
      $9 = 57;
      $A = 65, $E = 69, $Z = 90;
      $LBRACKET = 91;
      $__export("$LBRACKET", $LBRACKET);
      $BACKSLASH = 92;
      $__export("$BACKSLASH", $BACKSLASH);
      $RBRACKET = 93;
      $__export("$RBRACKET", $RBRACKET);
      $CARET = 94;
      $_ = 95;
      $a = 97, $e = 101, $f = 102, $n = 110, $r = 114, $t = 116, $u = 117, $v = 118, $z = 122;
      $LBRACE = 123;
      $__export("$LBRACE", $LBRACE);
      $BAR = 124;
      $__export("$BAR", $BAR);
      $RBRACE = 125;
      $__export("$RBRACE", $RBRACE);
      $NBSP = 160;
      ScannerError = (function($__super) {
        function ScannerError(message) {
          $traceurRuntime.superConstructor(ScannerError).call(this);
          this.message = message;
        }
        return ($traceurRuntime.createClass)(ScannerError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      $__export("ScannerError", ScannerError);
      _Scanner = (function() {
        function _Scanner(input) {
          this.input = input;
          this.length = input.length;
          this.peek = 0;
          this.index = -1;
          this.advance();
        }
        return ($traceurRuntime.createClass)(_Scanner, {
          advance: function() {
            this.peek = ++this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
          },
          scanToken: function() {
            var input = this.input,
                length = this.length,
                peek = this.peek,
                index = this.index;
            while (peek <= $SPACE) {
              if (++index >= length) {
                peek = $EOF;
                break;
              } else {
                peek = StringWrapper.charCodeAt(input, index);
              }
            }
            this.peek = peek;
            this.index = index;
            if (index >= length) {
              return null;
            }
            if (isIdentifierStart(peek))
              return this.scanIdentifier();
            if (isDigit(peek))
              return this.scanNumber(index);
            var start = index;
            switch (peek) {
              case $PERIOD:
                this.advance();
                return isDigit(this.peek) ? this.scanNumber(start) : newCharacterToken(start, $PERIOD);
              case $LPAREN:
              case $RPAREN:
              case $LBRACE:
              case $RBRACE:
              case $LBRACKET:
              case $RBRACKET:
              case $COMMA:
              case $COLON:
              case $SEMICOLON:
                return this.scanCharacter(start, peek);
              case $SQ:
              case $DQ:
                return this.scanString();
              case $HASH:
                return this.scanOperator(start, StringWrapper.fromCharCode(peek));
              case $PLUS:
              case $MINUS:
              case $STAR:
              case $SLASH:
              case $PERCENT:
              case $CARET:
              case $QUESTION:
                return this.scanOperator(start, StringWrapper.fromCharCode(peek));
              case $LT:
              case $GT:
              case $BANG:
              case $EQ:
                return this.scanComplexOperator(start, $EQ, StringWrapper.fromCharCode(peek), '=');
              case $AMPERSAND:
                return this.scanComplexOperator(start, $AMPERSAND, '&', '&');
              case $BAR:
                return this.scanComplexOperator(start, $BAR, '|', '|');
              case $NBSP:
                while (isWhitespace(this.peek))
                  this.advance();
                return this.scanToken();
            }
            this.error(("Unexpected character [" + StringWrapper.fromCharCode(peek) + "]"), 0);
            return null;
          },
          scanCharacter: function(start, code) {
            assert(this.peek == code);
            this.advance();
            return newCharacterToken(start, code);
          },
          scanOperator: function(start, str) {
            assert(this.peek == StringWrapper.charCodeAt(str, 0));
            assert(SetWrapper.has(OPERATORS, str));
            this.advance();
            return newOperatorToken(start, str);
          },
          scanComplexOperator: function(start, code, one, two) {
            assert(this.peek == StringWrapper.charCodeAt(one, 0));
            this.advance();
            var str = one;
            while (this.peek == code) {
              this.advance();
              str += two;
            }
            assert(SetWrapper.has(OPERATORS, str));
            return newOperatorToken(start, str);
          },
          scanIdentifier: function() {
            assert(isIdentifierStart(this.peek));
            var start = this.index;
            this.advance();
            while (isIdentifierPart(this.peek))
              this.advance();
            var str = this.input.substring(start, this.index);
            if (SetWrapper.has(KEYWORDS, str)) {
              return newKeywordToken(start, str);
            } else {
              return newIdentifierToken(start, str);
            }
          },
          scanNumber: function(start) {
            assert(isDigit(this.peek));
            var simple = (this.index === start);
            this.advance();
            while (true) {
              if (isDigit(this.peek)) {} else if (this.peek == $PERIOD) {
                simple = false;
              } else if (isExponentStart(this.peek)) {
                this.advance();
                if (isExponentSign(this.peek))
                  this.advance();
                if (!isDigit(this.peek))
                  this.error('Invalid exponent', -1);
                simple = false;
              } else {
                break;
              }
              this.advance();
            }
            var str = this.input.substring(start, this.index);
            var value = simple ? NumberWrapper.parseIntAutoRadix(str) : NumberWrapper.parseFloat(str);
            return newNumberToken(start, value);
          },
          scanString: function() {
            assert(this.peek == $SQ || this.peek == $DQ);
            var start = this.index;
            var quote = this.peek;
            this.advance();
            var buffer;
            var marker = this.index;
            var input = this.input;
            while (this.peek != quote) {
              if (this.peek == $BACKSLASH) {
                if (buffer == null)
                  buffer = new StringJoiner();
                buffer.add(input.substring(marker, this.index));
                this.advance();
                var unescapedCode = void 0;
                if (this.peek == $u) {
                  var hex = input.substring(this.index + 1, this.index + 5);
                  try {
                    unescapedCode = NumberWrapper.parseInt(hex, 16);
                  } catch (e) {
                    this.error(("Invalid unicode escape [\\u" + hex + "]"), 0);
                  }
                  for (var i = 0; i < 5; i++) {
                    this.advance();
                  }
                } else {
                  unescapedCode = unescape(this.peek);
                  this.advance();
                }
                buffer.add(StringWrapper.fromCharCode(unescapedCode));
                marker = this.index;
              } else if (this.peek == $EOF) {
                this.error('Unterminated quote', 0);
              } else {
                this.advance();
              }
            }
            var last = input.substring(marker, this.index);
            this.advance();
            var unescaped = last;
            if (buffer != null) {
              buffer.add(last);
              unescaped = buffer.toString();
            }
            return newStringToken(start, unescaped);
          },
          error: function(message, offset) {
            var position = this.index + offset;
            throw new ScannerError(("Lexer Error: " + message + " at column " + position + " in expression [" + this.input + "]"));
          }
        }, {});
      }());
      OPERATORS = SetWrapper.createFromList(['+', '-', '*', '/', '%', '^', '=', '==', '!=', '===', '!==', '<', '>', '<=', '>=', '&&', '||', '&', '|', '!', '?', '#']);
      KEYWORDS = SetWrapper.createFromList(['var', 'null', 'undefined', 'true', 'false']);
    }
  };
});

System.register("angular2/src/change_detection/parser/parser", ["angular2/src/di/decorators", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/parser/lexer", "angular2/src/reflection/reflection", "angular2/src/change_detection/parser/ast"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/parser/parser";
  var __decorate,
      __metadata,
      Injectable,
      isBlank,
      isPresent,
      BaseException,
      StringWrapper,
      RegExpWrapper,
      ListWrapper,
      Lexer,
      EOF,
      $PERIOD,
      $COLON,
      $SEMICOLON,
      $LBRACKET,
      $RBRACKET,
      $COMMA,
      $LBRACE,
      $RBRACE,
      $LPAREN,
      $RPAREN,
      reflector,
      Reflector,
      EmptyExpr,
      ImplicitReceiver,
      AccessMember,
      LiteralPrimitive,
      Binary,
      PrefixNot,
      Conditional,
      Pipe,
      Assignment,
      Chain,
      KeyedAccess,
      LiteralArray,
      LiteralMap,
      Interpolation,
      MethodCall,
      FunctionCall,
      TemplateBinding,
      ASTWithSource,
      _implicitReceiver,
      INTERPOLATION_REGEXP,
      Parser,
      _ParseAST;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      StringWrapper = $__m.StringWrapper;
      RegExpWrapper = $__m.RegExpWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      Lexer = $__m.Lexer;
      EOF = $__m.EOF;
      $PERIOD = $__m.$PERIOD;
      $COLON = $__m.$COLON;
      $SEMICOLON = $__m.$SEMICOLON;
      $LBRACKET = $__m.$LBRACKET;
      $RBRACKET = $__m.$RBRACKET;
      $COMMA = $__m.$COMMA;
      $LBRACE = $__m.$LBRACE;
      $RBRACE = $__m.$RBRACE;
      $LPAREN = $__m.$LPAREN;
      $RPAREN = $__m.$RPAREN;
    }, function($__m) {
      reflector = $__m.reflector;
      Reflector = $__m.Reflector;
    }, function($__m) {
      EmptyExpr = $__m.EmptyExpr;
      ImplicitReceiver = $__m.ImplicitReceiver;
      AccessMember = $__m.AccessMember;
      LiteralPrimitive = $__m.LiteralPrimitive;
      Binary = $__m.Binary;
      PrefixNot = $__m.PrefixNot;
      Conditional = $__m.Conditional;
      Pipe = $__m.Pipe;
      Assignment = $__m.Assignment;
      Chain = $__m.Chain;
      KeyedAccess = $__m.KeyedAccess;
      LiteralArray = $__m.LiteralArray;
      LiteralMap = $__m.LiteralMap;
      Interpolation = $__m.Interpolation;
      MethodCall = $__m.MethodCall;
      FunctionCall = $__m.FunctionCall;
      TemplateBinding = $__m.TemplateBinding;
      ASTWithSource = $__m.ASTWithSource;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      _implicitReceiver = new ImplicitReceiver();
      INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');
      Parser = (($traceurRuntime.createClass)(function(lexer) {
        var providedReflector = arguments[1] !== (void 0) ? arguments[1] : null;
        this._lexer = lexer;
        this._reflector = isPresent(providedReflector) ? providedReflector : reflector;
      }, {
        parseAction: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          var ast = new _ParseAST(input, location, tokens, this._reflector, true).parseChain();
          return new ASTWithSource(ast, input, location);
        },
        parseBinding: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
          return new ASTWithSource(ast, input, location);
        },
        addPipes: function(bindingAst, pipes) {
          if (ListWrapper.isEmpty(pipes))
            return bindingAst;
          var res = ListWrapper.reduce(pipes, (function(result, currentPipeName) {
            return new Pipe(result, currentPipeName, [], false);
          }), bindingAst.ast);
          return new ASTWithSource(res, bindingAst.source, bindingAst.location);
        },
        parseTemplateBindings: function(input, location) {
          var tokens = this._lexer.tokenize(input);
          return new _ParseAST(input, location, tokens, this._reflector, false).parseTemplateBindings();
        },
        parseInterpolation: function(input, location) {
          var parts = StringWrapper.split(input, INTERPOLATION_REGEXP);
          if (parts.length <= 1) {
            return null;
          }
          var strings = [];
          var expressions = [];
          for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (i % 2 === 0) {
              ListWrapper.push(strings, part);
            } else {
              var tokens = this._lexer.tokenize(part);
              var ast = new _ParseAST(input, location, tokens, this._reflector, false).parseChain();
              ListWrapper.push(expressions, ast);
            }
          }
          return new ASTWithSource(new Interpolation(strings, expressions), input, location);
        },
        wrapLiteralPrimitive: function(input, location) {
          return new ASTWithSource(new LiteralPrimitive(input), input, location);
        }
      }, {}));
      $__export("Parser", Parser);
      $__export("Parser", Parser = __decorate([Injectable(), __metadata('design:paramtypes', [Lexer, Reflector])], Parser));
      _ParseAST = (function() {
        function _ParseAST(input, location, tokens, reflector, parseAction) {
          this.input = input;
          this.location = location;
          this.tokens = tokens;
          this.reflector = reflector;
          this.parseAction = parseAction;
          this.index = 0;
        }
        return ($traceurRuntime.createClass)(_ParseAST, {
          peek: function(offset) {
            var i = this.index + offset;
            return i < this.tokens.length ? this.tokens[i] : EOF;
          },
          get next() {
            return this.peek(0);
          },
          get inputIndex() {
            return (this.index < this.tokens.length) ? this.next.index : this.input.length;
          },
          advance: function() {
            this.index++;
          },
          optionalCharacter: function(code) {
            if (this.next.isCharacter(code)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          optionalKeywordVar: function() {
            if (this.peekKeywordVar()) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          peekKeywordVar: function() {
            return this.next.isKeywordVar() || this.next.isOperator('#');
          },
          expectCharacter: function(code) {
            if (this.optionalCharacter(code))
              return ;
            this.error(("Missing expected " + StringWrapper.fromCharCode(code)));
          },
          optionalOperator: function(op) {
            if (this.next.isOperator(op)) {
              this.advance();
              return true;
            } else {
              return false;
            }
          },
          expectOperator: function(operator) {
            if (this.optionalOperator(operator))
              return ;
            this.error(("Missing expected operator " + operator));
          },
          expectIdentifierOrKeyword: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword()) {
              this.error(("Unexpected token " + n + ", expected identifier or keyword"));
            }
            this.advance();
            return n.toString();
          },
          expectIdentifierOrKeywordOrString: function() {
            var n = this.next;
            if (!n.isIdentifier() && !n.isKeyword() && !n.isString()) {
              this.error(("Unexpected token " + n + ", expected identifier, keyword, or string"));
            }
            this.advance();
            return n.toString();
          },
          parseChain: function() {
            var exprs = [];
            while (this.index < this.tokens.length) {
              var expr = this.parsePipe();
              ListWrapper.push(exprs, expr);
              if (this.optionalCharacter($SEMICOLON)) {
                if (!this.parseAction) {
                  this.error("Binding expression cannot contain chained expression");
                }
                while (this.optionalCharacter($SEMICOLON)) {}
              } else if (this.index < this.tokens.length) {
                this.error(("Unexpected token '" + this.next + "'"));
              }
            }
            if (exprs.length == 0)
              return new EmptyExpr();
            if (exprs.length == 1)
              return exprs[0];
            return new Chain(exprs);
          },
          parsePipe: function() {
            var result = this.parseExpression();
            if (this.optionalOperator("|")) {
              return this.parseInlinedPipe(result);
            } else {
              return result;
            }
          },
          parseExpression: function() {
            var start = this.inputIndex;
            var result = this.parseConditional();
            while (this.next.isOperator('=')) {
              if (!result.isAssignable) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Expression " + expression + " is not assignable"));
              }
              if (!this.parseAction) {
                this.error("Binding expression cannot contain assignments");
              }
              this.expectOperator('=');
              result = new Assignment(result, this.parseConditional());
            }
            return result;
          },
          parseConditional: function() {
            var start = this.inputIndex;
            var result = this.parseLogicalOr();
            if (this.optionalOperator('?')) {
              var yes = this.parseExpression();
              if (!this.optionalCharacter($COLON)) {
                var end = this.inputIndex;
                var expression = this.input.substring(start, end);
                this.error(("Conditional expression " + expression + " requires all 3 expressions"));
              }
              var no = this.parseExpression();
              return new Conditional(result, yes, no);
            } else {
              return result;
            }
          },
          parseLogicalOr: function() {
            var result = this.parseLogicalAnd();
            while (this.optionalOperator('||')) {
              result = new Binary('||', result, this.parseLogicalAnd());
            }
            return result;
          },
          parseLogicalAnd: function() {
            var result = this.parseEquality();
            while (this.optionalOperator('&&')) {
              result = new Binary('&&', result, this.parseEquality());
            }
            return result;
          },
          parseEquality: function() {
            var result = this.parseRelational();
            while (true) {
              if (this.optionalOperator('==')) {
                result = new Binary('==', result, this.parseRelational());
              } else if (this.optionalOperator('===')) {
                result = new Binary('===', result, this.parseRelational());
              } else if (this.optionalOperator('!=')) {
                result = new Binary('!=', result, this.parseRelational());
              } else if (this.optionalOperator('!==')) {
                result = new Binary('!==', result, this.parseRelational());
              } else {
                return result;
              }
            }
          },
          parseRelational: function() {
            var result = this.parseAdditive();
            while (true) {
              if (this.optionalOperator('<')) {
                result = new Binary('<', result, this.parseAdditive());
              } else if (this.optionalOperator('>')) {
                result = new Binary('>', result, this.parseAdditive());
              } else if (this.optionalOperator('<=')) {
                result = new Binary('<=', result, this.parseAdditive());
              } else if (this.optionalOperator('>=')) {
                result = new Binary('>=', result, this.parseAdditive());
              } else {
                return result;
              }
            }
          },
          parseAdditive: function() {
            var result = this.parseMultiplicative();
            while (true) {
              if (this.optionalOperator('+')) {
                result = new Binary('+', result, this.parseMultiplicative());
              } else if (this.optionalOperator('-')) {
                result = new Binary('-', result, this.parseMultiplicative());
              } else {
                return result;
              }
            }
          },
          parseMultiplicative: function() {
            var result = this.parsePrefix();
            while (true) {
              if (this.optionalOperator('*')) {
                result = new Binary('*', result, this.parsePrefix());
              } else if (this.optionalOperator('%')) {
                result = new Binary('%', result, this.parsePrefix());
              } else if (this.optionalOperator('/')) {
                result = new Binary('/', result, this.parsePrefix());
              } else {
                return result;
              }
            }
          },
          parsePrefix: function() {
            if (this.optionalOperator('+')) {
              return this.parsePrefix();
            } else if (this.optionalOperator('-')) {
              return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
            } else if (this.optionalOperator('!')) {
              return new PrefixNot(this.parsePrefix());
            } else {
              return this.parseCallChain();
            }
          },
          parseCallChain: function() {
            var result = this.parsePrimary();
            while (true) {
              if (this.optionalCharacter($PERIOD)) {
                result = this.parseAccessMemberOrMethodCall(result);
              } else if (this.optionalCharacter($LBRACKET)) {
                var key = this.parseExpression();
                this.expectCharacter($RBRACKET);
                result = new KeyedAccess(result, key);
              } else if (this.optionalCharacter($LPAREN)) {
                var args = this.parseCallArguments();
                this.expectCharacter($RPAREN);
                result = new FunctionCall(result, args);
              } else {
                return result;
              }
            }
          },
          parsePrimary: function() {
            if (this.optionalCharacter($LPAREN)) {
              var result = this.parsePipe();
              this.expectCharacter($RPAREN);
              return result;
            } else if (this.next.isKeywordNull() || this.next.isKeywordUndefined()) {
              this.advance();
              return new LiteralPrimitive(null);
            } else if (this.next.isKeywordTrue()) {
              this.advance();
              return new LiteralPrimitive(true);
            } else if (this.next.isKeywordFalse()) {
              this.advance();
              return new LiteralPrimitive(false);
            } else if (this.optionalCharacter($LBRACKET)) {
              var elements = this.parseExpressionList($RBRACKET);
              this.expectCharacter($RBRACKET);
              return new LiteralArray(elements);
            } else if (this.next.isCharacter($LBRACE)) {
              return this.parseLiteralMap();
            } else if (this.next.isIdentifier()) {
              return this.parseAccessMemberOrMethodCall(_implicitReceiver);
            } else if (this.next.isNumber()) {
              var value = this.next.toNumber();
              this.advance();
              return new LiteralPrimitive(value);
            } else if (this.next.isString()) {
              var literalValue = this.next.toString();
              this.advance();
              return new LiteralPrimitive(literalValue);
            } else if (this.index >= this.tokens.length) {
              this.error(("Unexpected end of expression: " + this.input));
            } else {
              this.error(("Unexpected token " + this.next));
            }
          },
          parseExpressionList: function(terminator) {
            var result = [];
            if (!this.next.isCharacter(terminator)) {
              do {
                ListWrapper.push(result, this.parseExpression());
              } while (this.optionalCharacter($COMMA));
            }
            return result;
          },
          parseLiteralMap: function() {
            var keys = [];
            var values = [];
            this.expectCharacter($LBRACE);
            if (!this.optionalCharacter($RBRACE)) {
              do {
                var key = this.expectIdentifierOrKeywordOrString();
                ListWrapper.push(keys, key);
                this.expectCharacter($COLON);
                ListWrapper.push(values, this.parseExpression());
              } while (this.optionalCharacter($COMMA));
              this.expectCharacter($RBRACE);
            }
            return new LiteralMap(keys, values);
          },
          parseAccessMemberOrMethodCall: function(receiver) {
            var id = this.expectIdentifierOrKeyword();
            if (this.optionalCharacter($LPAREN)) {
              var args = this.parseCallArguments();
              this.expectCharacter($RPAREN);
              var fn = this.reflector.method(id);
              return new MethodCall(receiver, id, fn, args);
            } else {
              var getter = this.reflector.getter(id);
              var setter = this.reflector.setter(id);
              var am = new AccessMember(receiver, id, getter, setter);
              if (this.optionalOperator("|")) {
                return this.parseInlinedPipe(am);
              } else {
                return am;
              }
            }
          },
          parseInlinedPipe: function(result) {
            do {
              if (this.parseAction) {
                this.error("Cannot have a pipe in an action expression");
              }
              var name = this.expectIdentifierOrKeyword();
              var args = ListWrapper.create();
              while (this.optionalCharacter($COLON)) {
                ListWrapper.push(args, this.parseExpression());
              }
              result = new Pipe(result, name, args, true);
            } while (this.optionalOperator("|"));
            return result;
          },
          parseCallArguments: function() {
            if (this.next.isCharacter($RPAREN))
              return [];
            var positionals = [];
            do {
              ListWrapper.push(positionals, this.parseExpression());
            } while (this.optionalCharacter($COMMA));
            return positionals;
          },
          expectTemplateBindingKey: function() {
            var result = '';
            var operatorFound = false;
            do {
              result += this.expectIdentifierOrKeywordOrString();
              operatorFound = this.optionalOperator('-');
              if (operatorFound) {
                result += '-';
              }
            } while (operatorFound);
            return result.toString();
          },
          parseTemplateBindings: function() {
            var bindings = [];
            var prefix = null;
            while (this.index < this.tokens.length) {
              var keyIsVar = this.optionalKeywordVar();
              var key = this.expectTemplateBindingKey();
              if (!keyIsVar) {
                if (prefix == null) {
                  prefix = key;
                } else {
                  key = prefix + '-' + key;
                }
              }
              this.optionalCharacter($COLON);
              var name = null;
              var expression = null;
              if (this.next !== EOF) {
                if (keyIsVar) {
                  if (this.optionalOperator("=")) {
                    name = this.expectTemplateBindingKey();
                  } else {
                    name = '\$implicit';
                  }
                } else if (!this.peekKeywordVar()) {
                  var start = this.inputIndex;
                  var ast = this.parsePipe();
                  var source = this.input.substring(start, this.inputIndex);
                  expression = new ASTWithSource(ast, source, this.location);
                }
              }
              ListWrapper.push(bindings, new TemplateBinding(key, keyIsVar, name, expression));
              if (!this.optionalCharacter($SEMICOLON)) {
                this.optionalCharacter($COMMA);
              }
            }
            return bindings;
          },
          error: function(message) {
            var index = arguments[1] !== (void 0) ? arguments[1] : null;
            if (isBlank(index))
              index = this.index;
            var location = (index < this.tokens.length) ? ("at column " + (this.tokens[index].index + 1) + " in") : "at the end of the expression";
            throw new BaseException(("Parser Error: " + message + " " + location + " [" + this.input + "] in " + this.location));
          }
        }, {});
      }());
    }
  };
});

System.register("angular2/src/change_detection/proto_change_detector", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/change_detection/parser/ast", "angular2/src/change_detection/interfaces", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/dynamic_change_detector", "angular2/src/change_detection/change_detection_jit_generator", "angular2/src/change_detection/directive_record", "angular2/src/change_detection/coalesce", "angular2/src/change_detection/proto_record"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/proto_change_detector";
  var BaseException,
      isPresent,
      isString,
      ListWrapper,
      ImplicitReceiver,
      ProtoChangeDetector,
      ChangeDetectionUtil,
      DynamicChangeDetector,
      ChangeDetectorJITGenerator,
      DirectiveIndex,
      coalesce,
      ProtoRecord,
      RECORD_TYPE_PROPERTY,
      RECORD_TYPE_LOCAL,
      RECORD_TYPE_INVOKE_METHOD,
      RECORD_TYPE_CONST,
      RECORD_TYPE_INVOKE_CLOSURE,
      RECORD_TYPE_PRIMITIVE_OP,
      RECORD_TYPE_KEYED_ACCESS,
      RECORD_TYPE_PIPE,
      RECORD_TYPE_BINDING_PIPE,
      RECORD_TYPE_INTERPOLATE,
      DynamicProtoChangeDetector,
      _jitProtoChangeDetectorClassCounter,
      JitProtoChangeDetector,
      ProtoRecordBuilder,
      _ConvertAstIntoProtoRecords;
  function _arrayFn(length) {
    switch (length) {
      case 0:
        return ChangeDetectionUtil.arrayFn0;
      case 1:
        return ChangeDetectionUtil.arrayFn1;
      case 2:
        return ChangeDetectionUtil.arrayFn2;
      case 3:
        return ChangeDetectionUtil.arrayFn3;
      case 4:
        return ChangeDetectionUtil.arrayFn4;
      case 5:
        return ChangeDetectionUtil.arrayFn5;
      case 6:
        return ChangeDetectionUtil.arrayFn6;
      case 7:
        return ChangeDetectionUtil.arrayFn7;
      case 8:
        return ChangeDetectionUtil.arrayFn8;
      case 9:
        return ChangeDetectionUtil.arrayFn9;
      default:
        throw new BaseException("Does not support literal maps with more than 9 elements");
    }
  }
  function _mapPrimitiveName(keys) {
    var stringifiedKeys = ListWrapper.join(ListWrapper.map(keys, (function(k) {
      return isString(k) ? ("\"" + k + "\"") : ("" + k);
    })), ", ");
    return ("mapFn([" + stringifiedKeys + "])");
  }
  function _operationToPrimitiveName(operation) {
    switch (operation) {
      case '+':
        return "operation_add";
      case '-':
        return "operation_subtract";
      case '*':
        return "operation_multiply";
      case '/':
        return "operation_divide";
      case '%':
        return "operation_remainder";
      case '==':
        return "operation_equals";
      case '!=':
        return "operation_not_equals";
      case '===':
        return "operation_identical";
      case '!==':
        return "operation_not_identical";
      case '<':
        return "operation_less_then";
      case '>':
        return "operation_greater_then";
      case '<=':
        return "operation_less_or_equals_then";
      case '>=':
        return "operation_greater_or_equals_then";
      case '&&':
        return "operation_logical_and";
      case '||':
        return "operation_logical_or";
      default:
        throw new BaseException(("Unsupported operation " + operation));
    }
  }
  function _operationToFunction(operation) {
    switch (operation) {
      case '+':
        return ChangeDetectionUtil.operation_add;
      case '-':
        return ChangeDetectionUtil.operation_subtract;
      case '*':
        return ChangeDetectionUtil.operation_multiply;
      case '/':
        return ChangeDetectionUtil.operation_divide;
      case '%':
        return ChangeDetectionUtil.operation_remainder;
      case '==':
        return ChangeDetectionUtil.operation_equals;
      case '!=':
        return ChangeDetectionUtil.operation_not_equals;
      case '===':
        return ChangeDetectionUtil.operation_identical;
      case '!==':
        return ChangeDetectionUtil.operation_not_identical;
      case '<':
        return ChangeDetectionUtil.operation_less_then;
      case '>':
        return ChangeDetectionUtil.operation_greater_then;
      case '<=':
        return ChangeDetectionUtil.operation_less_or_equals_then;
      case '>=':
        return ChangeDetectionUtil.operation_greater_or_equals_then;
      case '&&':
        return ChangeDetectionUtil.operation_logical_and;
      case '||':
        return ChangeDetectionUtil.operation_logical_or;
      default:
        throw new BaseException(("Unsupported operation " + operation));
    }
  }
  function s(v) {
    return isPresent(v) ? ("" + v) : '';
  }
  function _interpolationFn(strings) {
    var length = strings.length;
    var c0 = length > 0 ? strings[0] : null;
    var c1 = length > 1 ? strings[1] : null;
    var c2 = length > 2 ? strings[2] : null;
    var c3 = length > 3 ? strings[3] : null;
    var c4 = length > 4 ? strings[4] : null;
    var c5 = length > 5 ? strings[5] : null;
    var c6 = length > 6 ? strings[6] : null;
    var c7 = length > 7 ? strings[7] : null;
    var c8 = length > 8 ? strings[8] : null;
    var c9 = length > 9 ? strings[9] : null;
    switch (length - 1) {
      case 1:
        return (function(a1) {
          return c0 + s(a1) + c1;
        });
      case 2:
        return (function(a1, a2) {
          return c0 + s(a1) + c1 + s(a2) + c2;
        });
      case 3:
        return (function(a1, a2, a3) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3;
        });
      case 4:
        return (function(a1, a2, a3, a4) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
        });
      case 5:
        return (function(a1, a2, a3, a4, a5) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
        });
      case 6:
        return (function(a1, a2, a3, a4, a5, a6) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
        });
      case 7:
        return (function(a1, a2, a3, a4, a5, a6, a7) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7;
        });
      case 8:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8;
        });
      case 9:
        return (function(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8 + s(a9) + c9;
        });
      default:
        throw new BaseException("Does not support more than 9 expressions");
    }
  }
  return {
    setters: [function($__m) {
      BaseException = $__m.BaseException;
      isPresent = $__m.isPresent;
      isString = $__m.isString;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ImplicitReceiver = $__m.ImplicitReceiver;
    }, function($__m) {
      ProtoChangeDetector = $__m.ProtoChangeDetector;
    }, function($__m) {
      ChangeDetectionUtil = $__m.ChangeDetectionUtil;
    }, function($__m) {
      DynamicChangeDetector = $__m.DynamicChangeDetector;
    }, function($__m) {
      ChangeDetectorJITGenerator = $__m.ChangeDetectorJITGenerator;
    }, function($__m) {
      DirectiveIndex = $__m.DirectiveIndex;
    }, function($__m) {
      coalesce = $__m.coalesce;
    }, function($__m) {
      ProtoRecord = $__m.ProtoRecord;
      RECORD_TYPE_PROPERTY = $__m.RECORD_TYPE_PROPERTY;
      RECORD_TYPE_LOCAL = $__m.RECORD_TYPE_LOCAL;
      RECORD_TYPE_INVOKE_METHOD = $__m.RECORD_TYPE_INVOKE_METHOD;
      RECORD_TYPE_CONST = $__m.RECORD_TYPE_CONST;
      RECORD_TYPE_INVOKE_CLOSURE = $__m.RECORD_TYPE_INVOKE_CLOSURE;
      RECORD_TYPE_PRIMITIVE_OP = $__m.RECORD_TYPE_PRIMITIVE_OP;
      RECORD_TYPE_KEYED_ACCESS = $__m.RECORD_TYPE_KEYED_ACCESS;
      RECORD_TYPE_PIPE = $__m.RECORD_TYPE_PIPE;
      RECORD_TYPE_BINDING_PIPE = $__m.RECORD_TYPE_BINDING_PIPE;
      RECORD_TYPE_INTERPOLATE = $__m.RECORD_TYPE_INTERPOLATE;
    }],
    execute: function() {
      DynamicProtoChangeDetector = (function($__super) {
        function DynamicProtoChangeDetector(_pipeRegistry, definition) {
          $traceurRuntime.superConstructor(DynamicProtoChangeDetector).call(this);
          this._pipeRegistry = _pipeRegistry;
          this.definition = definition;
          this._records = this._createRecords(definition);
        }
        return ($traceurRuntime.createClass)(DynamicProtoChangeDetector, {
          instantiate: function(dispatcher) {
            return new DynamicChangeDetector(this.definition.strategy, dispatcher, this._pipeRegistry, this._records, this.definition.directiveRecords);
          },
          _createRecords: function(definition) {
            var recordBuilder = new ProtoRecordBuilder();
            ListWrapper.forEach(definition.bindingRecords, (function(b) {
              recordBuilder.addAst(b, definition.variableNames);
            }));
            return coalesce(recordBuilder.records);
          }
        }, {}, $__super);
      }(ProtoChangeDetector));
      $__export("DynamicProtoChangeDetector", DynamicProtoChangeDetector);
      _jitProtoChangeDetectorClassCounter = 0;
      JitProtoChangeDetector = (function($__super) {
        function JitProtoChangeDetector(_pipeRegistry, definition) {
          $traceurRuntime.superConstructor(JitProtoChangeDetector).call(this);
          this._pipeRegistry = _pipeRegistry;
          this.definition = definition;
          this._factory = this._createFactory(definition);
        }
        return ($traceurRuntime.createClass)(JitProtoChangeDetector, {
          instantiate: function(dispatcher) {
            return this._factory(dispatcher, this._pipeRegistry);
          },
          _createFactory: function(definition) {
            var recordBuilder = new ProtoRecordBuilder();
            ListWrapper.forEach(definition.bindingRecords, (function(b) {
              recordBuilder.addAst(b, definition.variableNames);
            }));
            var c = _jitProtoChangeDetectorClassCounter++;
            var records = coalesce(recordBuilder.records);
            var typeName = ("ChangeDetector" + c);
            return new ChangeDetectorJITGenerator(typeName, definition.strategy, records, this.definition.directiveRecords).generate();
          }
        }, {}, $__super);
      }(ProtoChangeDetector));
      $__export("JitProtoChangeDetector", JitProtoChangeDetector);
      ProtoRecordBuilder = (function() {
        function ProtoRecordBuilder() {
          this.records = [];
        }
        return ($traceurRuntime.createClass)(ProtoRecordBuilder, {addAst: function(b) {
            var variableNames = arguments[1] !== (void 0) ? arguments[1] : null;
            var oldLast = ListWrapper.last(this.records);
            if (isPresent(oldLast) && oldLast.bindingRecord.directiveRecord == b.directiveRecord) {
              oldLast.lastInDirective = false;
            }
            _ConvertAstIntoProtoRecords.append(this.records, b, variableNames);
            var newLast = ListWrapper.last(this.records);
            if (isPresent(newLast) && newLast !== oldLast) {
              newLast.lastInBinding = true;
              newLast.lastInDirective = true;
            }
          }}, {});
      }());
      _ConvertAstIntoProtoRecords = (function() {
        function _ConvertAstIntoProtoRecords(_records, _bindingRecord, _expressionAsString, _variableNames) {
          this._records = _records;
          this._bindingRecord = _bindingRecord;
          this._expressionAsString = _expressionAsString;
          this._variableNames = _variableNames;
        }
        return ($traceurRuntime.createClass)(_ConvertAstIntoProtoRecords, {
          visitImplicitReceiver: function(ast) {
            return this._bindingRecord.implicitReceiver;
          },
          visitInterpolation: function(ast) {
            var args = this._visitAll(ast.expressions);
            return this._addRecord(RECORD_TYPE_INTERPOLATE, "interpolate", _interpolationFn(ast.strings), args, ast.strings, 0);
          },
          visitLiteralPrimitive: function(ast) {
            return this._addRecord(RECORD_TYPE_CONST, "literal", ast.value, [], null, 0);
          },
          visitAccessMember: function(ast) {
            var receiver = ast.receiver.visit(this);
            if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name) && ast.receiver instanceof ImplicitReceiver) {
              return this._addRecord(RECORD_TYPE_LOCAL, ast.name, ast.name, [], null, receiver);
            } else {
              return this._addRecord(RECORD_TYPE_PROPERTY, ast.name, ast.getter, [], null, receiver);
            }
          },
          visitMethodCall: function(ast) {
            var receiver = ast.receiver.visit(this);
            var args = this._visitAll(ast.args);
            if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name)) {
              var target = this._addRecord(RECORD_TYPE_LOCAL, ast.name, ast.name, [], null, receiver);
              return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, "closure", null, args, null, target);
            } else {
              return this._addRecord(RECORD_TYPE_INVOKE_METHOD, ast.name, ast.fn, args, null, receiver);
            }
          },
          visitFunctionCall: function(ast) {
            var target = ast.target.visit(this);
            var args = this._visitAll(ast.args);
            return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, "closure", null, args, null, target);
          },
          visitLiteralArray: function(ast) {
            var primitiveName = ("arrayFn" + ast.expressions.length);
            return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, primitiveName, _arrayFn(ast.expressions.length), this._visitAll(ast.expressions), null, 0);
          },
          visitLiteralMap: function(ast) {
            return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, _mapPrimitiveName(ast.keys), ChangeDetectionUtil.mapFn(ast.keys), this._visitAll(ast.values), null, 0);
          },
          visitBinary: function(ast) {
            var left = ast.left.visit(this);
            var right = ast.right.visit(this);
            return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, _operationToPrimitiveName(ast.operation), _operationToFunction(ast.operation), [left, right], null, 0);
          },
          visitPrefixNot: function(ast) {
            var exp = ast.expression.visit(this);
            return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, "operation_negate", ChangeDetectionUtil.operation_negate, [exp], null, 0);
          },
          visitConditional: function(ast) {
            var c = ast.condition.visit(this);
            var t = ast.trueExp.visit(this);
            var f = ast.falseExp.visit(this);
            return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, "cond", ChangeDetectionUtil.cond, [c, t, f], null, 0);
          },
          visitPipe: function(ast) {
            var value = ast.exp.visit(this);
            var type = ast.inBinding ? RECORD_TYPE_BINDING_PIPE : RECORD_TYPE_PIPE;
            return this._addRecord(type, ast.name, ast.name, [], null, value);
          },
          visitKeyedAccess: function(ast) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            return this._addRecord(RECORD_TYPE_KEYED_ACCESS, "keyedAccess", ChangeDetectionUtil.keyedAccess, [key], null, obj);
          },
          _visitAll: function(asts) {
            var res = ListWrapper.createFixedSize(asts.length);
            for (var i = 0; i < asts.length; ++i) {
              res[i] = asts[i].visit(this);
            }
            return res;
          },
          _addRecord: function(type, name, funcOrValue, args, fixedArgs, context) {
            var selfIndex = this._records.length + 1;
            if (context instanceof DirectiveIndex) {
              ListWrapper.push(this._records, new ProtoRecord(type, name, funcOrValue, args, fixedArgs, -1, context, selfIndex, this._bindingRecord, this._expressionAsString, false, false));
            } else {
              ListWrapper.push(this._records, new ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, null, selfIndex, this._bindingRecord, this._expressionAsString, false, false));
            }
            return selfIndex;
          }
        }, {append: function(records, b, variableNames) {
            var c = new _ConvertAstIntoProtoRecords(records, b, b.ast.toString(), variableNames);
            b.ast.visit(c);
          }});
      }());
    }
  };
});

System.register("angular2/src/change_detection/change_detection", ["angular2/src/change_detection/proto_change_detector", "angular2/src/change_detection/pipes/pipe_registry", "angular2/src/change_detection/pipes/iterable_changes", "angular2/src/change_detection/pipes/keyvalue_changes", "angular2/src/change_detection/pipes/observable_pipe", "angular2/src/change_detection/pipes/promise_pipe", "angular2/src/change_detection/pipes/uppercase_pipe", "angular2/src/change_detection/pipes/lowercase_pipe", "angular2/src/change_detection/pipes/json_pipe", "angular2/src/change_detection/pipes/null_pipe", "angular2/src/change_detection/interfaces", "angular2/src/di/decorators", "angular2/src/facade/collection", "angular2/src/facade/lang"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/change_detection/change_detection";
  var __decorate,
      __metadata,
      DynamicProtoChangeDetector,
      JitProtoChangeDetector,
      PipeRegistry,
      IterableChangesFactory,
      KeyValueChangesFactory,
      ObservablePipeFactory,
      PromisePipeFactory,
      UpperCaseFactory,
      LowerCaseFactory,
      JsonPipeFactory,
      NullPipeFactory,
      ChangeDetection,
      Injectable,
      StringMapWrapper,
      isPresent,
      keyValDiff,
      iterableDiff,
      async,
      uppercase,
      lowercase,
      json,
      defaultPipes,
      preGeneratedProtoDetectors,
      PreGeneratedChangeDetection,
      DynamicChangeDetection,
      JitChangeDetection,
      defaultPipeRegistry;
  return {
    setters: [function($__m) {
      DynamicProtoChangeDetector = $__m.DynamicProtoChangeDetector;
      JitProtoChangeDetector = $__m.JitProtoChangeDetector;
    }, function($__m) {
      PipeRegistry = $__m.PipeRegistry;
    }, function($__m) {
      IterableChangesFactory = $__m.IterableChangesFactory;
    }, function($__m) {
      KeyValueChangesFactory = $__m.KeyValueChangesFactory;
    }, function($__m) {
      ObservablePipeFactory = $__m.ObservablePipeFactory;
    }, function($__m) {
      PromisePipeFactory = $__m.PromisePipeFactory;
    }, function($__m) {
      UpperCaseFactory = $__m.UpperCaseFactory;
    }, function($__m) {
      LowerCaseFactory = $__m.LowerCaseFactory;
    }, function($__m) {
      JsonPipeFactory = $__m.JsonPipeFactory;
    }, function($__m) {
      NullPipeFactory = $__m.NullPipeFactory;
    }, function($__m) {
      ChangeDetection = $__m.ChangeDetection;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      keyValDiff = [new KeyValueChangesFactory(), new NullPipeFactory()];
      $__export("keyValDiff", keyValDiff);
      iterableDiff = [new IterableChangesFactory(), new NullPipeFactory()];
      $__export("iterableDiff", iterableDiff);
      async = [new ObservablePipeFactory(), new PromisePipeFactory(), new NullPipeFactory()];
      $__export("async", async);
      uppercase = [new UpperCaseFactory(), new NullPipeFactory()];
      $__export("uppercase", uppercase);
      lowercase = [new LowerCaseFactory(), new NullPipeFactory()];
      $__export("lowercase", lowercase);
      json = [new JsonPipeFactory(), new NullPipeFactory()];
      $__export("json", json);
      defaultPipes = {
        "iterableDiff": iterableDiff,
        "keyValDiff": keyValDiff,
        "async": async,
        "uppercase": uppercase,
        "lowercase": lowercase,
        "json": json
      };
      $__export("defaultPipes", defaultPipes);
      preGeneratedProtoDetectors = {};
      $__export("preGeneratedProtoDetectors", preGeneratedProtoDetectors);
      PreGeneratedChangeDetection = (function($__super) {
        function PreGeneratedChangeDetection(registry, protoChangeDetectors) {
          $traceurRuntime.superConstructor(PreGeneratedChangeDetection).call(this);
          this.registry = registry;
          this._dynamicChangeDetection = new DynamicChangeDetection(registry);
          this._protoChangeDetectorFactories = isPresent(protoChangeDetectors) ? protoChangeDetectors : preGeneratedProtoDetectors;
        }
        return ($traceurRuntime.createClass)(PreGeneratedChangeDetection, {createProtoChangeDetector: function(definition) {
            var id = definition.id;
            if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
              return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(this.registry);
            }
            return this._dynamicChangeDetection.createProtoChangeDetector(definition);
          }}, {}, $__super);
      }(ChangeDetection));
      $__export("PreGeneratedChangeDetection", PreGeneratedChangeDetection);
      DynamicChangeDetection = (function($__super) {
        function $__0(registry) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.registry = registry;
        }
        return ($traceurRuntime.createClass)($__0, {createProtoChangeDetector: function(definition) {
            return new DynamicProtoChangeDetector(this.registry, definition);
          }}, {}, $__super);
      }(ChangeDetection));
      $__export("DynamicChangeDetection", DynamicChangeDetection);
      $__export("DynamicChangeDetection", DynamicChangeDetection = __decorate([Injectable(), __metadata('design:paramtypes', [PipeRegistry])], DynamicChangeDetection));
      JitChangeDetection = (function($__super) {
        function $__0(registry) {
          $traceurRuntime.superConstructor($__0).call(this);
          this.registry = registry;
        }
        return ($traceurRuntime.createClass)($__0, {createProtoChangeDetector: function(definition) {
            return new JitProtoChangeDetector(this.registry, definition);
          }}, {}, $__super);
      }(ChangeDetection));
      $__export("JitChangeDetection", JitChangeDetection);
      $__export("JitChangeDetection", JitChangeDetection = __decorate([Injectable(), __metadata('design:paramtypes', [PipeRegistry])], JitChangeDetection));
      defaultPipeRegistry = new PipeRegistry(defaultPipes);
      $__export("defaultPipeRegistry", defaultPipeRegistry);
    }
  };
});

System.register("angular2/src/di/injector", ["angular2/src/facade/collection", "angular2/src/di/binding", "angular2/src/di/exceptions", "angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/di/key", "angular2/src/di/forward_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/di/injector";
  var List,
      MapWrapper,
      ListWrapper,
      ResolvedBinding,
      Binding,
      BindingBuilder,
      bind,
      AbstractBindingError,
      NoBindingError,
      AsyncBindingError,
      CyclicDependencyError,
      InstantiationError,
      InvalidBindingError,
      FunctionWrapper,
      Type,
      isPresent,
      isBlank,
      PromiseWrapper,
      Key,
      resolveForwardRef,
      _constructing,
      _notFound,
      _Waiting,
      Injector,
      _SyncInjectorStrategy,
      _AsyncInjectorStrategy;
  function _isWaiting(obj) {
    return obj instanceof _Waiting;
  }
  function resolveBindings(bindings) {
    var resolvedList = ListWrapper.createFixedSize(bindings.length);
    for (var i = 0; i < bindings.length; i++) {
      var unresolved = resolveForwardRef(bindings[i]);
      var resolved = void 0;
      if (unresolved instanceof ResolvedBinding) {
        resolved = unresolved;
      } else if (unresolved instanceof Type) {
        resolved = bind(unresolved).toClass(unresolved).resolve();
      } else if (unresolved instanceof Binding) {
        resolved = unresolved.resolve();
      } else if (unresolved instanceof List) {
        resolved = resolveBindings(unresolved);
      } else if (unresolved instanceof BindingBuilder) {
        throw new InvalidBindingError(unresolved.token);
      } else {
        throw new InvalidBindingError(unresolved);
      }
      resolvedList[i] = resolved;
    }
    return resolvedList;
  }
  function flattenBindings(bindings) {
    var map = _flattenBindings(bindings, MapWrapper.create());
    var res = ListWrapper.create();
    MapWrapper.forEach(map, (function(binding, keyId) {
      return ListWrapper.push(res, binding);
    }));
    return res;
  }
  function _createListOfBindings(flattenedBindings) {
    var bindings = ListWrapper.createFixedSize(Key.numberOfKeys + 1);
    MapWrapper.forEach(flattenedBindings, (function(v, keyId) {
      return bindings[keyId] = v;
    }));
    return bindings;
  }
  function _flattenBindings(bindings, res) {
    ListWrapper.forEach(bindings, function(b) {
      if (b instanceof ResolvedBinding) {
        MapWrapper.set(res, b.key.id, b);
      } else if (b instanceof List) {
        _flattenBindings(b, res);
      }
    });
    return res;
  }
  $__export("resolveBindings", resolveBindings);
  return {
    setters: [function($__m) {
      List = $__m.List;
      MapWrapper = $__m.MapWrapper;
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      ResolvedBinding = $__m.ResolvedBinding;
      Binding = $__m.Binding;
      BindingBuilder = $__m.BindingBuilder;
      bind = $__m.bind;
    }, function($__m) {
      AbstractBindingError = $__m.AbstractBindingError;
      NoBindingError = $__m.NoBindingError;
      AsyncBindingError = $__m.AsyncBindingError;
      CyclicDependencyError = $__m.CyclicDependencyError;
      InstantiationError = $__m.InstantiationError;
      InvalidBindingError = $__m.InvalidBindingError;
    }, function($__m) {
      FunctionWrapper = $__m.FunctionWrapper;
      Type = $__m.Type;
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      Key = $__m.Key;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      _constructing = new Object();
      _notFound = new Object();
      _Waiting = (function() {
        function _Waiting(promise) {
          this.promise = promise;
        }
        return ($traceurRuntime.createClass)(_Waiting, {}, {});
      }());
      Injector = (function() {
        function Injector(bindings, parent, defaultBindings) {
          this._bindings = bindings;
          this._instances = this._createInstances();
          this._parent = parent;
          this._defaultBindings = defaultBindings;
          this._asyncStrategy = new _AsyncInjectorStrategy(this);
          this._syncStrategy = new _SyncInjectorStrategy(this);
        }
        return ($traceurRuntime.createClass)(Injector, {
          get parent() {
            return this._parent;
          },
          get: function(token) {
            return this._getByKey(Key.get(token), false, false, false);
          },
          getOptional: function(token) {
            return this._getByKey(Key.get(token), false, false, true);
          },
          asyncGet: function(token) {
            return this._getByKey(Key.get(token), true, false, false);
          },
          resolveAndCreateChild: function(bindings) {
            return new Injector(Injector.resolve(bindings), this, false);
          },
          createChildFromResolved: function(bindings) {
            return new Injector(bindings, this, false);
          },
          _createInstances: function() {
            return ListWrapper.createFixedSize(Key.numberOfKeys + 1);
          },
          _getByKey: function(key, returnPromise, returnLazy, optional) {
            var $__0 = this;
            if (returnLazy) {
              return (function() {
                return $__0._getByKey(key, returnPromise, false, optional);
              });
            }
            var strategy = returnPromise ? this._asyncStrategy : this._syncStrategy;
            var instance = strategy.readFromCache(key);
            if (instance !== _notFound)
              return instance;
            instance = strategy.instantiate(key);
            if (instance !== _notFound)
              return instance;
            if (isPresent(this._parent)) {
              return this._parent._getByKey(key, returnPromise, returnLazy, optional);
            }
            if (optional) {
              return null;
            } else {
              throw new NoBindingError(key);
            }
          },
          _resolveDependencies: function(key, binding, forceAsync) {
            var $__0 = this;
            try {
              var getDependency = (function(d) {
                return $__0._getByKey(d.key, forceAsync || d.asPromise, d.lazy, d.optional);
              });
              return ListWrapper.map(binding.dependencies, getDependency);
            } catch (e) {
              this._clear(key);
              if (e instanceof AbstractBindingError)
                e.addKey(key);
              throw e;
            }
          },
          _getInstance: function(key) {
            if (this._instances.length <= key.id)
              return null;
            return ListWrapper.get(this._instances, key.id);
          },
          _setInstance: function(key, obj) {
            ListWrapper.set(this._instances, key.id, obj);
          },
          _getBinding: function(key) {
            var binding = this._bindings.length <= key.id ? null : ListWrapper.get(this._bindings, key.id);
            if (isBlank(binding) && this._defaultBindings) {
              var token = key.token;
              return bind(key.token).toClass(token).resolve();
            } else {
              return binding;
            }
          },
          _markAsConstructing: function(key) {
            this._setInstance(key, _constructing);
          },
          _clear: function(key) {
            this._setInstance(key, null);
          }
        }, {
          resolve: function(bindings) {
            var resolvedBindings = resolveBindings(bindings);
            var flatten = _flattenBindings(resolvedBindings, MapWrapper.create());
            return _createListOfBindings(flatten);
          },
          resolveAndCreate: function(bindings) {
            var $__3;
            var $__2 = arguments[1] !== (void 0) ? arguments[1] : {},
                defaultBindings = ($__3 = $__2.defaultBindings) === void 0 ? false : $__3;
            return new Injector(Injector.resolve(bindings), null, defaultBindings);
          },
          fromResolvedBindings: function(bindings) {
            var $__3;
            var $__2 = arguments[1] !== (void 0) ? arguments[1] : {},
                defaultBindings = ($__3 = $__2.defaultBindings) === void 0 ? false : $__3;
            return new Injector(bindings, null, defaultBindings);
          }
        });
      }());
      $__export("Injector", Injector);
      _SyncInjectorStrategy = (function() {
        function _SyncInjectorStrategy(injector) {
          this.injector = injector;
        }
        return ($traceurRuntime.createClass)(_SyncInjectorStrategy, {
          readFromCache: function(key) {
            if (key.token === Injector) {
              return this.injector;
            }
            var instance = this.injector._getInstance(key);
            if (instance === _constructing) {
              throw new CyclicDependencyError(key);
            } else if (isPresent(instance) && !_isWaiting(instance)) {
              return instance;
            } else {
              return _notFound;
            }
          },
          instantiate: function(key) {
            var binding = this.injector._getBinding(key);
            if (isBlank(binding))
              return _notFound;
            if (binding.providedAsPromise)
              throw new AsyncBindingError(key);
            this.injector._markAsConstructing(key);
            var deps = this.injector._resolveDependencies(key, binding, false);
            return this._createInstance(key, binding, deps);
          },
          _createInstance: function(key, binding, deps) {
            try {
              var instance = FunctionWrapper.apply(binding.factory, deps);
              this.injector._setInstance(key, instance);
              return instance;
            } catch (e) {
              this.injector._clear(key);
              throw new InstantiationError(e, key);
            }
          }
        }, {});
      }());
      _AsyncInjectorStrategy = (function() {
        function _AsyncInjectorStrategy(injector) {
          this.injector = injector;
        }
        return ($traceurRuntime.createClass)(_AsyncInjectorStrategy, {
          readFromCache: function(key) {
            if (key.token === Injector) {
              return PromiseWrapper.resolve(this.injector);
            }
            var instance = this.injector._getInstance(key);
            if (instance === _constructing) {
              throw new CyclicDependencyError(key);
            } else if (_isWaiting(instance)) {
              return instance.promise;
            } else if (isPresent(instance)) {
              return PromiseWrapper.resolve(instance);
            } else {
              return _notFound;
            }
          },
          instantiate: function(key) {
            var $__0 = this;
            var binding = this.injector._getBinding(key);
            if (isBlank(binding))
              return _notFound;
            this.injector._markAsConstructing(key);
            var deps = this.injector._resolveDependencies(key, binding, true);
            var depsPromise = PromiseWrapper.all(deps);
            var promise = PromiseWrapper.then(depsPromise, null, (function(e, s) {
              return $__0._errorHandler(key, e, s);
            })).then((function(deps) {
              return $__0._findOrCreate(key, binding, deps);
            })).then((function(instance) {
              return $__0._cacheInstance(key, instance);
            }));
            this.injector._setInstance(key, new _Waiting(promise));
            return promise;
          },
          _errorHandler: function(key, e, stack) {
            if (e instanceof AbstractBindingError)
              e.addKey(key);
            return PromiseWrapper.reject(e, stack);
          },
          _findOrCreate: function(key, binding, deps) {
            try {
              var instance = this.injector._getInstance(key);
              if (!_isWaiting(instance))
                return instance;
              return FunctionWrapper.apply(binding.factory, deps);
            } catch (e) {
              this.injector._clear(key);
              throw new InstantiationError(e, key);
            }
          },
          _cacheInstance: function(key, instance) {
            this.injector._setInstance(key, instance);
            return instance;
          }
        }, {});
      }());
    }
  };
});

System.register("angular2/src/core/compiler/view_manager", ["angular2/di", "angular2/src/facade/lang", "angular2/src/core/compiler/view_ref", "angular2/src/render/api", "angular2/src/core/compiler/view_manager_utils", "angular2/src/core/compiler/view_pool"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/view_manager";
  var __decorate,
      __metadata,
      Injectable,
      isPresent,
      isBlank,
      BaseException,
      ViewRef,
      internalView,
      internalProtoView,
      Renderer,
      AppViewManagerUtils,
      AppViewPool,
      AppViewManager;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
    }, function($__m) {
      ViewRef = $__m.ViewRef;
      internalView = $__m.internalView;
      internalProtoView = $__m.internalProtoView;
    }, function($__m) {
      Renderer = $__m.Renderer;
    }, function($__m) {
      AppViewManagerUtils = $__m.AppViewManagerUtils;
    }, function($__m) {
      AppViewPool = $__m.AppViewPool;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      AppViewManager = (($traceurRuntime.createClass)(function(viewPool, utils, renderer) {
        this._renderer = renderer;
        this._viewPool = viewPool;
        this._utils = utils;
      }, {
        getComponentView: function(hostLocation) {
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          return new ViewRef(hostView.componentChildViews[boundElementIndex]);
        },
        getViewContainer: function(location) {
          var hostView = internalView(location.parentView);
          return hostView.elementInjectors[location.boundElementIndex].getViewContainerRef();
        },
        getComponent: function(hostLocation) {
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          return this._utils.getComponentInstance(hostView, boundElementIndex);
        },
        createDynamicComponentView: function(hostLocation, componentProtoViewRef, componentBinding, injector) {
          var componentProtoView = internalProtoView(componentProtoViewRef);
          var hostView = internalView(hostLocation.parentView);
          var boundElementIndex = hostLocation.boundElementIndex;
          var binder = hostView.proto.elementBinders[boundElementIndex];
          if (!binder.hasDynamicComponent()) {
            throw new BaseException(("There is no dynamic component directive at element " + boundElementIndex));
          }
          var componentView = this._createPooledView(componentProtoView);
          this._renderer.attachComponentView(hostView.render, boundElementIndex, componentView.render);
          this._utils.attachComponentView(hostView, boundElementIndex, componentView);
          this._utils.hydrateDynamicComponentInElementInjector(hostView, boundElementIndex, componentBinding, injector);
          this._utils.hydrateComponentView(hostView, boundElementIndex);
          this._viewHydrateRecurse(componentView);
          return new ViewRef(componentView);
        },
        createRootHostView: function(hostProtoViewRef, overrideSelector, injector) {
          var hostProtoView = internalProtoView(hostProtoViewRef);
          var hostElementSelector = overrideSelector;
          if (isBlank(hostElementSelector)) {
            hostElementSelector = hostProtoView.elementBinders[0].componentDirective.metadata.selector;
          }
          var renderView = this._renderer.createRootHostView(hostProtoView.render, hostElementSelector);
          var hostView = this._utils.createView(hostProtoView, renderView, this, this._renderer);
          this._renderer.setEventDispatcher(hostView.render, hostView);
          this._createViewRecurse(hostView);
          this._utils.hydrateRootHostView(hostView, injector);
          this._viewHydrateRecurse(hostView);
          return new ViewRef(hostView);
        },
        destroyRootHostView: function(hostViewRef) {
          var hostView = internalView(hostViewRef);
          this._viewDehydrateRecurse(hostView, true);
          this._renderer.destroyView(hostView.render);
        },
        createFreeHostView: function(parentComponentLocation, hostProtoViewRef, injector) {
          var hostProtoView = internalProtoView(hostProtoViewRef);
          var hostView = this._createPooledView(hostProtoView);
          var parentComponentHostView = internalView(parentComponentLocation.parentView);
          var parentComponentBoundElementIndex = parentComponentLocation.boundElementIndex;
          this._utils.attachAndHydrateFreeHostView(parentComponentHostView, parentComponentBoundElementIndex, hostView, injector);
          this._viewHydrateRecurse(hostView);
          return new ViewRef(hostView);
        },
        destroyFreeHostView: function(parentComponentLocation, hostViewRef) {
          var hostView = internalView(hostViewRef);
          var parentView = internalView(parentComponentLocation.parentView).componentChildViews[parentComponentLocation.boundElementIndex];
          this._destroyFreeHostView(parentView, hostView);
        },
        createViewInContainer: function(viewContainerLocation, atIndex, protoViewRef) {
          var context = arguments[3] !== (void 0) ? arguments[3] : null;
          var injector = arguments[4] !== (void 0) ? arguments[4] : null;
          var protoView = internalProtoView(protoViewRef);
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          var contextView = null;
          var contextBoundElementIndex = null;
          if (isPresent(context)) {
            contextView = internalView(context.parentView);
            contextBoundElementIndex = context.boundElementIndex;
          }
          var view = this._createPooledView(protoView);
          this._renderer.attachViewInContainer(parentView.render, boundElementIndex, atIndex, view.render);
          this._utils.attachViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, view);
          this._utils.hydrateViewInContainer(parentView, boundElementIndex, contextView, contextBoundElementIndex, atIndex, injector);
          this._viewHydrateRecurse(view);
          return new ViewRef(view);
        },
        destroyViewInContainer: function(viewContainerLocation, atIndex) {
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          this._destroyViewInContainer(parentView, boundElementIndex, atIndex);
        },
        attachViewInContainer: function(viewContainerLocation, atIndex, viewRef) {
          var view = internalView(viewRef);
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          this._utils.attachViewInContainer(parentView, boundElementIndex, null, null, atIndex, view);
          this._renderer.attachViewInContainer(parentView.render, boundElementIndex, atIndex, view.render);
          return viewRef;
        },
        detachViewInContainer: function(viewContainerLocation, atIndex) {
          var parentView = internalView(viewContainerLocation.parentView);
          var boundElementIndex = viewContainerLocation.boundElementIndex;
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
          this._renderer.detachViewInContainer(parentView.render, boundElementIndex, atIndex, view.render);
          return new ViewRef(view);
        },
        _createPooledView: function(protoView) {
          var view = this._viewPool.getView(protoView);
          if (isBlank(view)) {
            view = this._utils.createView(protoView, this._renderer.createView(protoView.render), this, this._renderer);
            this._renderer.setEventDispatcher(view.render, view);
            this._createViewRecurse(view);
          }
          return view;
        },
        _createViewRecurse: function(view) {
          var binders = view.proto.elementBinders;
          for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
            var binder = binders[binderIdx];
            if (binder.hasStaticComponent()) {
              var childView = this._createPooledView(binder.nestedProtoView);
              this._renderer.attachComponentView(view.render, binderIdx, childView.render);
              this._utils.attachComponentView(view, binderIdx, childView);
            }
          }
        },
        _destroyPooledView: function(view) {
          this._viewPool.returnView(view);
        },
        _destroyViewInContainer: function(parentView, boundElementIndex, atIndex) {
          var viewContainer = parentView.viewContainers[boundElementIndex];
          var view = viewContainer.views[atIndex];
          this._viewDehydrateRecurse(view, false);
          this._utils.detachViewInContainer(parentView, boundElementIndex, atIndex);
          this._renderer.detachViewInContainer(parentView.render, boundElementIndex, atIndex, view.render);
          this._destroyPooledView(view);
        },
        _destroyComponentView: function(hostView, boundElementIndex, componentView) {
          this._viewDehydrateRecurse(componentView, false);
          this._renderer.detachComponentView(hostView.render, boundElementIndex, componentView.render);
          this._utils.detachComponentView(hostView, boundElementIndex);
          this._destroyPooledView(componentView);
        },
        _destroyFreeHostView: function(parentView, hostView) {
          this._viewDehydrateRecurse(hostView, true);
          this._renderer.detachFreeHostView(parentView.render, hostView.render);
          this._utils.detachFreeHostView(parentView, hostView);
          this._destroyPooledView(hostView);
        },
        _viewHydrateRecurse: function(view) {
          this._renderer.hydrateView(view.render);
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; ++i) {
            if (binders[i].hasStaticComponent()) {
              this._utils.hydrateComponentView(view, i);
              this._viewHydrateRecurse(view.componentChildViews[i]);
            }
          }
        },
        _viewDehydrateRecurse: function(view, forceDestroyComponents) {
          this._utils.dehydrateView(view);
          this._renderer.dehydrateView(view.render);
          var binders = view.proto.elementBinders;
          for (var i = 0; i < binders.length; i++) {
            var componentView = view.componentChildViews[i];
            if (isPresent(componentView)) {
              if (binders[i].hasDynamicComponent() || forceDestroyComponents) {
                this._destroyComponentView(view, i, componentView);
              } else {
                this._viewDehydrateRecurse(componentView, false);
              }
            }
            var vc = view.viewContainers[i];
            if (isPresent(vc)) {
              for (var j = vc.views.length - 1; j >= 0; j--) {
                this._destroyViewInContainer(view, i, j);
              }
            }
          }
          for (var i = view.freeHostViews.length - 1; i >= 0; i--) {
            var hostView = view.freeHostViews[i];
            this._destroyFreeHostView(view, hostView);
          }
        }
      }, {}));
      $__export("AppViewManager", AppViewManager);
      $__export("AppViewManager", AppViewManager = __decorate([Injectable(), __metadata('design:paramtypes', [AppViewPool, AppViewManagerUtils, Renderer])], AppViewManager));
    }
  };
});

System.register("angular2/src/render/dom/compiler/compiler", ["angular2/di", "angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/dom/dom_adapter", "angular2/src/render/api", "angular2/src/render/dom/compiler/compile_pipeline", "angular2/src/render/dom/compiler/template_loader", "angular2/src/render/dom/compiler/compile_step_factory", "angular2/change_detection", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/render/dom/compiler/compiler";
  var __decorate,
      __metadata,
      Injectable,
      PromiseWrapper,
      BaseException,
      DOM,
      ViewDefinition,
      ProtoViewDto,
      RenderCompiler,
      CompilePipeline,
      TemplateLoader,
      DefaultStepFactory,
      Parser,
      ShadowDomStrategy,
      DomCompiler,
      DefaultDomCompiler;
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      BaseException = $__m.BaseException;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      ViewDefinition = $__m.ViewDefinition;
      ProtoViewDto = $__m.ProtoViewDto;
      RenderCompiler = $__m.RenderCompiler;
    }, function($__m) {
      CompilePipeline = $__m.CompilePipeline;
    }, function($__m) {
      TemplateLoader = $__m.TemplateLoader;
    }, function($__m) {
      DefaultStepFactory = $__m.DefaultStepFactory;
    }, function($__m) {
      Parser = $__m.Parser;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      DomCompiler = (function($__super) {
        function DomCompiler(stepFactory, templateLoader) {
          $traceurRuntime.superConstructor(DomCompiler).call(this);
          this._templateLoader = templateLoader;
          this._stepFactory = stepFactory;
        }
        return ($traceurRuntime.createClass)(DomCompiler, {
          compile: function(template) {
            var $__0 = this;
            var tplPromise = this._templateLoader.load(template);
            return PromiseWrapper.then(tplPromise, (function(el) {
              return $__0._compileTemplate(template, el, ProtoViewDto.COMPONENT_VIEW_TYPE);
            }), (function(_) {
              throw new BaseException(("Failed to load the template \"" + template.componentId + "\""));
            }));
          },
          compileHost: function(directiveMetadata) {
            var hostViewDef = new ViewDefinition({
              componentId: directiveMetadata.id,
              absUrl: null,
              template: null,
              directives: [directiveMetadata]
            });
            var element = DOM.createElement(directiveMetadata.selector);
            return this._compileTemplate(hostViewDef, element, ProtoViewDto.HOST_VIEW_TYPE);
          },
          _compileTemplate: function(viewDef, tplElement, protoViewType) {
            var subTaskPromises = [];
            var pipeline = new CompilePipeline(this._stepFactory.createSteps(viewDef, subTaskPromises));
            var compileElements = pipeline.process(tplElement, protoViewType, viewDef.componentId);
            var protoView = compileElements[0].inheritedProtoView.build();
            if (subTaskPromises.length > 0) {
              return PromiseWrapper.all(subTaskPromises).then((function(_) {
                return protoView;
              }));
            } else {
              return PromiseWrapper.resolve(protoView);
            }
          }
        }, {}, $__super);
      }(RenderCompiler));
      $__export("DomCompiler", DomCompiler);
      DefaultDomCompiler = (function($__super) {
        function $__1(parser, shadowDomStrategy, templateLoader) {
          $traceurRuntime.superConstructor($__1).call(this, new DefaultStepFactory(parser, shadowDomStrategy), templateLoader);
        }
        return ($traceurRuntime.createClass)($__1, {}, {}, $__super);
      }(DomCompiler));
      $__export("DefaultDomCompiler", DefaultDomCompiler);
      $__export("DefaultDomCompiler", DefaultDomCompiler = __decorate([Injectable(), __metadata('design:paramtypes', [Parser, ShadowDomStrategy, TemplateLoader])], DefaultDomCompiler));
    }
  };
});

System.register("angular2/change_detection", ["angular2/src/change_detection/parser/ast", "angular2/src/change_detection/parser/lexer", "angular2/src/change_detection/parser/parser", "angular2/src/change_detection/parser/locals", "angular2/src/change_detection/exceptions", "angular2/src/change_detection/interfaces", "angular2/src/change_detection/constants", "angular2/src/change_detection/proto_change_detector", "angular2/src/change_detection/binding_record", "angular2/src/change_detection/directive_record", "angular2/src/change_detection/dynamic_change_detector", "angular2/src/change_detection/change_detector_ref", "angular2/src/change_detection/pipes/pipe_registry", "angular2/src/change_detection/change_detection_util", "angular2/src/change_detection/pipes/pipe", "angular2/src/change_detection/pipes/null_pipe", "angular2/src/change_detection/change_detection"], function($__export) {
  "use strict";
  var __moduleName = "angular2/change_detection";
  return {
    setters: [function($__m) {
      $__export("ASTWithSource", $__m.ASTWithSource);
      $__export("AST", $__m.AST);
      $__export("AstTransformer", $__m.AstTransformer);
      $__export("AccessMember", $__m.AccessMember);
      $__export("LiteralArray", $__m.LiteralArray);
      $__export("ImplicitReceiver", $__m.ImplicitReceiver);
    }, function($__m) {
      $__export("Lexer", $__m.Lexer);
    }, function($__m) {
      $__export("Parser", $__m.Parser);
    }, function($__m) {
      $__export("Locals", $__m.Locals);
    }, function($__m) {
      $__export("ExpressionChangedAfterItHasBeenChecked", $__m.ExpressionChangedAfterItHasBeenChecked);
      $__export("ChangeDetectionError", $__m.ChangeDetectionError);
    }, function($__m) {
      $__export("ProtoChangeDetector", $__m.ProtoChangeDetector);
      $__export("ChangeDispatcher", $__m.ChangeDispatcher);
      $__export("ChangeDetector", $__m.ChangeDetector);
      $__export("ChangeDetection", $__m.ChangeDetection);
      $__export("ChangeDetectorDefinition", $__m.ChangeDetectorDefinition);
    }, function($__m) {
      $__export("CHECK_ONCE", $__m.CHECK_ONCE);
      $__export("CHECK_ALWAYS", $__m.CHECK_ALWAYS);
      $__export("DETACHED", $__m.DETACHED);
      $__export("CHECKED", $__m.CHECKED);
      $__export("ON_PUSH", $__m.ON_PUSH);
      $__export("DEFAULT", $__m.DEFAULT);
    }, function($__m) {
      $__export("DynamicProtoChangeDetector", $__m.DynamicProtoChangeDetector);
      $__export("JitProtoChangeDetector", $__m.JitProtoChangeDetector);
    }, function($__m) {
      $__export("BindingRecord", $__m.BindingRecord);
    }, function($__m) {
      $__export("DirectiveIndex", $__m.DirectiveIndex);
      $__export("DirectiveRecord", $__m.DirectiveRecord);
    }, function($__m) {
      $__export("DynamicChangeDetector", $__m.DynamicChangeDetector);
    }, function($__m) {
      $__export("ChangeDetectorRef", $__m.ChangeDetectorRef);
    }, function($__m) {
      $__export("PipeRegistry", $__m.PipeRegistry);
    }, function($__m) {
      $__export("uninitialized", $__m.uninitialized);
    }, function($__m) {
      $__export("WrappedValue", $__m.WrappedValue);
      $__export("Pipe", $__m.Pipe);
    }, function($__m) {
      $__export("NullPipe", $__m.NullPipe);
      $__export("NullPipeFactory", $__m.NullPipeFactory);
    }, function($__m) {
      $__export("defaultPipes", $__m.defaultPipes);
      $__export("DynamicChangeDetection", $__m.DynamicChangeDetection);
      $__export("JitChangeDetection", $__m.JitChangeDetection);
      $__export("PreGeneratedChangeDetection", $__m.PreGeneratedChangeDetection);
      $__export("preGeneratedProtoDetectors", $__m.preGeneratedProtoDetectors);
      $__export("defaultPipeRegistry", $__m.defaultPipeRegistry);
    }],
    execute: function() {}
  };
});

System.register("angular2/di", ["angular2/src/di/annotations", "angular2/src/di/decorators", "angular2/src/di/forward_ref", "angular2/src/di/injector", "angular2/src/di/binding", "angular2/src/di/key", "angular2/src/di/exceptions", "angular2/src/di/opaque_token"], function($__export) {
  "use strict";
  var __moduleName = "angular2/di";
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("resolveBindings", $__m.resolveBindings);
      $__export("Injector", $__m.Injector);
    }, function($__m) {
      $__export("Binding", $__m.Binding);
      $__export("ResolvedBinding", $__m.ResolvedBinding);
      $__export("Dependency", $__m.Dependency);
      $__export("bind", $__m.bind);
    }, function($__m) {
      $__export("Key", $__m.Key);
      $__export("KeyRegistry", $__m.KeyRegistry);
      $__export("TypeLiteral", $__m.TypeLiteral);
    }, function($__m) {
      $__export("NoBindingError", $__m.NoBindingError);
      $__export("AbstractBindingError", $__m.AbstractBindingError);
      $__export("AsyncBindingError", $__m.AsyncBindingError);
      $__export("CyclicDependencyError", $__m.CyclicDependencyError);
      $__export("InstantiationError", $__m.InstantiationError);
      $__export("InvalidBindingError", $__m.InvalidBindingError);
      $__export("NoAnnotationError", $__m.NoAnnotationError);
    }, function($__m) {
      $__export("OpaqueToken", $__m.OpaqueToken);
    }],
    execute: function() {}
  };
});

System.register("angular2/src/core/compiler/element_injector", ["angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/di", "angular2/src/core/annotations_impl/visibility", "angular2/src/core/annotations_impl/di", "angular2/src/core/compiler/view_manager", "angular2/src/core/compiler/view_container_ref", "angular2/src/core/compiler/element_ref", "angular2/src/core/compiler/view_ref", "angular2/src/core/annotations_impl/annotations", "angular2/change_detection", "angular2/src/core/compiler/query_list", "angular2/src/reflection/reflection", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/element_injector";
  var isPresent,
      isBlank,
      BaseException,
      stringify,
      ObservableWrapper,
      ListWrapper,
      MapWrapper,
      Injector,
      Key,
      Dependency,
      Binding,
      ResolvedBinding,
      NoBindingError,
      AbstractBindingError,
      CyclicDependencyError,
      resolveForwardRef,
      resolveBindings,
      Visibility,
      self,
      Attribute,
      Query,
      avmModule,
      ViewContainerRef,
      ElementRef,
      ProtoViewRef,
      ViewRef,
      Directive,
      Component,
      onChange,
      onDestroy,
      onAllChangesDone,
      ChangeDetectorRef,
      QueryList,
      reflector,
      DirectiveMetadata,
      _MAX_DIRECTIVE_CONSTRUCTION_COUNTER,
      _undefined,
      _staticKeys,
      StaticKeys,
      TreeNode,
      DependencyWithVisibility,
      DirectiveDependency,
      DirectiveBinding,
      PreBuiltObjects,
      EventEmitterAccessor,
      HostActionAccessor,
      LIGHT_DOM,
      SHADOW_DOM,
      LIGHT_DOM_AND_SHADOW_DOM,
      BindingData,
      ProtoElementInjector,
      ElementInjector,
      OutOfBoundsAccess,
      QueryError,
      QueryRef;
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      isBlank = $__m.isBlank;
      BaseException = $__m.BaseException;
      stringify = $__m.stringify;
    }, function($__m) {
      ObservableWrapper = $__m.ObservableWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      Injector = $__m.Injector;
      Key = $__m.Key;
      Dependency = $__m.Dependency;
      Binding = $__m.Binding;
      ResolvedBinding = $__m.ResolvedBinding;
      NoBindingError = $__m.NoBindingError;
      AbstractBindingError = $__m.AbstractBindingError;
      CyclicDependencyError = $__m.CyclicDependencyError;
      resolveForwardRef = $__m.resolveForwardRef;
      resolveBindings = $__m.resolveBindings;
    }, function($__m) {
      Visibility = $__m.Visibility;
      self = $__m.self;
    }, function($__m) {
      Attribute = $__m.Attribute;
      Query = $__m.Query;
    }, function($__m) {
      avmModule = $__m;
    }, function($__m) {
      ViewContainerRef = $__m.ViewContainerRef;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      ProtoViewRef = $__m.ProtoViewRef;
      ViewRef = $__m.ViewRef;
    }, function($__m) {
      Directive = $__m.Directive;
      Component = $__m.Component;
      onChange = $__m.onChange;
      onDestroy = $__m.onDestroy;
      onAllChangesDone = $__m.onAllChangesDone;
    }, function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
    }, function($__m) {
      QueryList = $__m.QueryList;
    }, function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      DirectiveMetadata = $__m.DirectiveMetadata;
    }],
    execute: function() {
      _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;
      _undefined = new Object();
      StaticKeys = (function() {
        function StaticKeys() {
          this.viewManagerId = Key.get(avmModule.AppViewManager).id;
          this.protoViewId = Key.get(ProtoViewRef).id;
          this.viewContainerId = Key.get(ViewContainerRef).id;
          this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
          this.elementRefId = Key.get(ElementRef).id;
        }
        return ($traceurRuntime.createClass)(StaticKeys, {}, {instance: function() {
            if (isBlank(_staticKeys))
              _staticKeys = new StaticKeys();
            return _staticKeys;
          }});
      }());
      TreeNode = (function() {
        function TreeNode(parent) {
          this._head = null;
          this._tail = null;
          this._next = null;
          if (isPresent(parent))
            parent.addChild(this);
        }
        return ($traceurRuntime.createClass)(TreeNode, {
          _assertConsistency: function() {
            this._assertHeadBeforeTail();
            this._assertTailReachable();
            this._assertPresentInParentList();
          },
          _assertHeadBeforeTail: function() {
            if (isBlank(this._tail) && isPresent(this._head))
              throw new BaseException('null tail but non-null head');
          },
          _assertTailReachable: function() {
            if (isBlank(this._tail))
              return ;
            if (isPresent(this._tail._next))
              throw new BaseException('node after tail');
            var p = this._head;
            while (isPresent(p) && p != this._tail)
              p = p._next;
            if (isBlank(p) && isPresent(this._tail))
              throw new BaseException('tail not reachable.');
          },
          _assertPresentInParentList: function() {
            var p = this._parent;
            if (isBlank(p)) {
              return ;
            }
            var cur = p._head;
            while (isPresent(cur) && cur != this)
              cur = cur._next;
            if (isBlank(cur))
              throw new BaseException('node not reachable through parent.');
          },
          addChild: function(child) {
            if (isPresent(this._tail)) {
              this._tail._next = child;
              this._tail = child;
            } else {
              this._tail = this._head = child;
            }
            child._next = null;
            child._parent = this;
            this._assertConsistency();
          },
          addChildAfter: function(child, prevSibling) {
            this._assertConsistency();
            if (isBlank(prevSibling)) {
              var prevHead = this._head;
              this._head = child;
              child._next = prevHead;
              if (isBlank(this._tail))
                this._tail = child;
            } else if (isBlank(prevSibling._next)) {
              this.addChild(child);
              return ;
            } else {
              prevSibling._assertPresentInParentList();
              child._next = prevSibling._next;
              prevSibling._next = child;
            }
            child._parent = this;
            this._assertConsistency();
          },
          remove: function() {
            this._assertConsistency();
            if (isBlank(this.parent))
              return ;
            var nextSibling = this._next;
            var prevSibling = this._findPrev();
            if (isBlank(prevSibling)) {
              this.parent._head = this._next;
            } else {
              prevSibling._next = this._next;
            }
            if (isBlank(nextSibling)) {
              this._parent._tail = prevSibling;
            }
            this._parent._assertConsistency();
            this._parent = null;
            this._next = null;
            this._assertConsistency();
          },
          _findPrev: function() {
            var node = this.parent._head;
            if (node == this)
              return null;
            while (node._next !== this)
              node = node._next;
            return node;
          },
          get parent() {
            return this._parent;
          },
          get children() {
            var res = [];
            var child = this._head;
            while (child != null) {
              ListWrapper.push(res, child);
              child = child._next;
            }
            return res;
          }
        }, {});
      }());
      $__export("TreeNode", TreeNode);
      DependencyWithVisibility = (function($__super) {
        function DependencyWithVisibility(key, asPromise, lazy, optional, properties, visibility) {
          $traceurRuntime.superConstructor(DependencyWithVisibility).call(this, key, asPromise, lazy, optional, properties);
          this.visibility = visibility;
        }
        return ($traceurRuntime.createClass)(DependencyWithVisibility, {}, {
          createFrom: function(d) {
            return new DependencyWithVisibility(d.key, d.asPromise, d.lazy, d.optional, d.properties, DependencyWithVisibility._visibility(d.properties));
          },
          _visibility: function(properties) {
            if (properties.length == 0)
              return self;
            var p = ListWrapper.find(properties, (function(p) {
              return p instanceof Visibility;
            }));
            return isPresent(p) ? p : self;
          }
        }, $__super);
      }(Dependency));
      $__export("DependencyWithVisibility", DependencyWithVisibility);
      DirectiveDependency = (function($__super) {
        function DirectiveDependency(key, asPromise, lazy, optional, properties, visibility, attributeName, queryDirective) {
          $traceurRuntime.superConstructor(DirectiveDependency).call(this, key, asPromise, lazy, optional, properties, visibility);
          this.attributeName = attributeName;
          this.queryDirective = queryDirective;
          this._verify();
        }
        return ($traceurRuntime.createClass)(DirectiveDependency, {_verify: function() {
            var count = 0;
            if (isPresent(this.queryDirective))
              count++;
            if (isPresent(this.attributeName))
              count++;
            if (count > 1)
              throw new BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
          }}, {
          createFrom: function(d) {
            return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.optional, d.properties, DependencyWithVisibility._visibility(d.properties), DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
          },
          _attributeName: function(properties) {
            var p = ListWrapper.find(properties, (function(p) {
              return p instanceof Attribute;
            }));
            return isPresent(p) ? p.attributeName : null;
          },
          _query: function(properties) {
            var p = ListWrapper.find(properties, (function(p) {
              return p instanceof Query;
            }));
            return isPresent(p) ? resolveForwardRef(p.directive) : null;
          }
        }, $__super);
      }(DependencyWithVisibility));
      $__export("DirectiveDependency", DirectiveDependency);
      DirectiveBinding = (function($__super) {
        function DirectiveBinding(key, factory, dependencies, providedAsPromise, resolvedAppInjectables, resolvedHostInjectables, resolvedViewInjectables, metadata) {
          $traceurRuntime.superConstructor(DirectiveBinding).call(this, key, factory, dependencies, providedAsPromise);
          this.resolvedAppInjectables = resolvedAppInjectables;
          this.resolvedHostInjectables = resolvedHostInjectables;
          this.resolvedViewInjectables = resolvedViewInjectables;
          this.metadata = metadata;
        }
        return ($traceurRuntime.createClass)(DirectiveBinding, {
          get callOnDestroy() {
            return this.metadata.callOnDestroy;
          },
          get callOnChange() {
            return this.metadata.callOnChange;
          },
          get callOnAllChangesDone() {
            return this.metadata.callOnAllChangesDone;
          },
          get displayName() {
            return this.key.displayName;
          },
          get eventEmitters() {
            return isPresent(this.metadata) && isPresent(this.metadata.events) ? this.metadata.events : [];
          },
          get hostActions() {
            return isPresent(this.metadata) && isPresent(this.metadata.hostActions) ? this.metadata.hostActions : MapWrapper.create();
          },
          get changeDetection() {
            return this.metadata.changeDetection;
          }
        }, {
          createFromBinding: function(binding, ann) {
            if (isBlank(ann)) {
              ann = new Directive();
            }
            var rb = binding.resolve();
            var deps = ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
            var resolvedAppInjectables = ann instanceof Component && isPresent(ann.appInjector) ? Injector.resolve(ann.appInjector) : [];
            var resolvedHostInjectables = isPresent(ann.hostInjector) ? resolveBindings(ann.hostInjector) : [];
            var resolvedViewInjectables = ann instanceof Component && isPresent(ann.viewInjector) ? resolveBindings(ann.viewInjector) : [];
            var metadata = new DirectiveMetadata({
              id: stringify(rb.key.token),
              type: ann instanceof Component ? DirectiveMetadata.COMPONENT_TYPE : DirectiveMetadata.DIRECTIVE_TYPE,
              selector: ann.selector,
              compileChildren: ann.compileChildren,
              events: ann.events,
              hostListeners: isPresent(ann.hostListeners) ? MapWrapper.createFromStringMap(ann.hostListeners) : null,
              hostProperties: isPresent(ann.hostProperties) ? MapWrapper.createFromStringMap(ann.hostProperties) : null,
              hostAttributes: isPresent(ann.hostAttributes) ? MapWrapper.createFromStringMap(ann.hostAttributes) : null,
              hostActions: isPresent(ann.hostActions) ? MapWrapper.createFromStringMap(ann.hostActions) : null,
              properties: isPresent(ann.properties) ? MapWrapper.createFromStringMap(ann.properties) : null,
              readAttributes: DirectiveBinding._readAttributes(deps),
              callOnDestroy: ann.hasLifecycleHook(onDestroy),
              callOnChange: ann.hasLifecycleHook(onChange),
              callOnAllChangesDone: ann.hasLifecycleHook(onAllChangesDone),
              changeDetection: ann instanceof Component ? ann.changeDetection : null
            });
            return new DirectiveBinding(rb.key, rb.factory, deps, rb.providedAsPromise, resolvedAppInjectables, resolvedHostInjectables, resolvedViewInjectables, metadata);
          },
          _readAttributes: function(deps) {
            var readAttributes = [];
            ListWrapper.forEach(deps, (function(dep) {
              if (isPresent(dep.attributeName)) {
                ListWrapper.push(readAttributes, dep.attributeName);
              }
            }));
            return readAttributes;
          },
          createFromType: function(type, annotation) {
            var binding = new Binding(type, {toClass: type});
            return DirectiveBinding.createFromBinding(binding, annotation);
          }
        }, $__super);
      }(ResolvedBinding));
      $__export("DirectiveBinding", DirectiveBinding);
      PreBuiltObjects = (function() {
        function PreBuiltObjects(viewManager, view, protoView) {
          this.viewManager = viewManager;
          this.view = view;
          this.protoView = protoView;
        }
        return ($traceurRuntime.createClass)(PreBuiltObjects, {}, {});
      }());
      $__export("PreBuiltObjects", PreBuiltObjects);
      EventEmitterAccessor = (function() {
        function EventEmitterAccessor(eventName, getter) {
          this.eventName = eventName;
          this.getter = getter;
        }
        return ($traceurRuntime.createClass)(EventEmitterAccessor, {subscribe: function(view, boundElementIndex, directive) {
            var $__0 = this;
            var eventEmitter = this.getter(directive);
            return ObservableWrapper.subscribe(eventEmitter, (function(eventObj) {
              return view.triggerEventHandlers($__0.eventName, eventObj, boundElementIndex);
            }));
          }}, {});
      }());
      $__export("EventEmitterAccessor", EventEmitterAccessor);
      HostActionAccessor = (function() {
        function HostActionAccessor(actionExpression, getter) {
          this.actionExpression = actionExpression;
          this.getter = getter;
        }
        return ($traceurRuntime.createClass)(HostActionAccessor, {subscribe: function(view, boundElementIndex, directive) {
            var $__0 = this;
            var eventEmitter = this.getter(directive);
            return ObservableWrapper.subscribe(eventEmitter, (function(actionObj) {
              return view.callAction(boundElementIndex, $__0.actionExpression, actionObj);
            }));
          }}, {});
      }());
      $__export("HostActionAccessor", HostActionAccessor);
      LIGHT_DOM = 1;
      SHADOW_DOM = 2;
      LIGHT_DOM_AND_SHADOW_DOM = 3;
      BindingData = (function() {
        function BindingData(binding, visibility) {
          this.binding = binding;
          this.visibility = visibility;
        }
        return ($traceurRuntime.createClass)(BindingData, {
          getKeyId: function() {
            return this.binding.key.id;
          },
          createEventEmitterAccessors: function() {
            if (!(this.binding instanceof DirectiveBinding))
              return [];
            var db = this.binding;
            return ListWrapper.map(db.eventEmitters, (function(eventName) {
              return new EventEmitterAccessor(eventName, reflector.getter(eventName));
            }));
          },
          createHostActionAccessors: function() {
            if (!(this.binding instanceof DirectiveBinding))
              return [];
            var res = [];
            var db = this.binding;
            MapWrapper.forEach(db.hostActions, (function(actionExpression, actionName) {
              ListWrapper.push(res, new HostActionAccessor(actionExpression, reflector.getter(actionName)));
            }));
            return res;
          }
        }, {});
      }());
      $__export("BindingData", BindingData);
      ProtoElementInjector = (function() {
        function ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent) {
          this.parent = parent;
          this.index = index;
          this.distanceToParent = distanceToParent;
          this.exportComponent = false;
          this.exportElement = false;
          this._firstBindingIsComponent = firstBindingIsComponent;
          this._binding0 = null;
          this._keyId0 = null;
          this._visibility0 = null;
          this._binding1 = null;
          this._keyId1 = null;
          this._visibility1 = null;
          this._binding2 = null;
          this._keyId2 = null;
          this._visibility2 = null;
          this._binding3 = null;
          this._keyId3 = null;
          this._visibility3 = null;
          this._binding4 = null;
          this._keyId4 = null;
          this._visibility4 = null;
          this._binding5 = null;
          this._keyId5 = null;
          this._visibility5 = null;
          this._binding6 = null;
          this._keyId6 = null;
          this._visibility6 = null;
          this._binding7 = null;
          this._keyId7 = null;
          this._visibility7 = null;
          this._binding8 = null;
          this._keyId8 = null;
          this._visibility8 = null;
          this._binding9 = null;
          this._keyId9 = null;
          this._visibility9 = null;
          var length = bd.length;
          this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
          this.hostActionAccessors = ListWrapper.createFixedSize(length);
          if (length > 0) {
            this._binding0 = bd[0].binding;
            this._keyId0 = bd[0].getKeyId();
            this._visibility0 = bd[0].visibility;
            this.eventEmitterAccessors[0] = bd[0].createEventEmitterAccessors();
            this.hostActionAccessors[0] = bd[0].createHostActionAccessors();
          }
          if (length > 1) {
            this._binding1 = bd[1].binding;
            this._keyId1 = bd[1].getKeyId();
            this._visibility1 = bd[1].visibility;
            this.eventEmitterAccessors[1] = bd[1].createEventEmitterAccessors();
            this.hostActionAccessors[1] = bd[1].createHostActionAccessors();
          }
          if (length > 2) {
            this._binding2 = bd[2].binding;
            this._keyId2 = bd[2].getKeyId();
            this._visibility2 = bd[2].visibility;
            this.eventEmitterAccessors[2] = bd[2].createEventEmitterAccessors();
            this.hostActionAccessors[2] = bd[2].createHostActionAccessors();
          }
          if (length > 3) {
            this._binding3 = bd[3].binding;
            this._keyId3 = bd[3].getKeyId();
            this._visibility3 = bd[3].visibility;
            this.eventEmitterAccessors[3] = bd[3].createEventEmitterAccessors();
            this.hostActionAccessors[3] = bd[3].createHostActionAccessors();
          }
          if (length > 4) {
            this._binding4 = bd[4].binding;
            this._keyId4 = bd[4].getKeyId();
            this._visibility4 = bd[4].visibility;
            this.eventEmitterAccessors[4] = bd[4].createEventEmitterAccessors();
            this.hostActionAccessors[4] = bd[4].createHostActionAccessors();
          }
          if (length > 5) {
            this._binding5 = bd[5].binding;
            this._keyId5 = bd[5].getKeyId();
            this._visibility5 = bd[5].visibility;
            this.eventEmitterAccessors[5] = bd[5].createEventEmitterAccessors();
            this.hostActionAccessors[5] = bd[5].createHostActionAccessors();
          }
          if (length > 6) {
            this._binding6 = bd[6].binding;
            this._keyId6 = bd[6].getKeyId();
            this._visibility6 = bd[6].visibility;
            this.eventEmitterAccessors[6] = bd[6].createEventEmitterAccessors();
            this.hostActionAccessors[6] = bd[6].createHostActionAccessors();
          }
          if (length > 7) {
            this._binding7 = bd[7].binding;
            this._keyId7 = bd[7].getKeyId();
            this._visibility7 = bd[7].visibility;
            this.eventEmitterAccessors[7] = bd[7].createEventEmitterAccessors();
            this.hostActionAccessors[7] = bd[7].createHostActionAccessors();
          }
          if (length > 8) {
            this._binding8 = bd[8].binding;
            this._keyId8 = bd[8].getKeyId();
            this._visibility8 = bd[8].visibility;
            this.eventEmitterAccessors[8] = bd[8].createEventEmitterAccessors();
            this.hostActionAccessors[8] = bd[8].createHostActionAccessors();
          }
          if (length > 9) {
            this._binding9 = bd[9].binding;
            this._keyId9 = bd[9].getKeyId();
            this._visibility9 = bd[9].visibility;
            this.eventEmitterAccessors[9] = bd[9].createEventEmitterAccessors();
            this.hostActionAccessors[9] = bd[9].createHostActionAccessors();
          }
          if (length > 10) {
            throw 'Maximum number of directives per element has been reached.';
          }
        }
        return ($traceurRuntime.createClass)(ProtoElementInjector, {
          instantiate: function(parent) {
            return new ElementInjector(this, parent);
          },
          directParent: function() {
            return this.distanceToParent < 2 ? this.parent : null;
          },
          get hasBindings() {
            return isPresent(this._binding0);
          },
          getBindingAtIndex: function(index) {
            if (index == 0)
              return this._binding0;
            if (index == 1)
              return this._binding1;
            if (index == 2)
              return this._binding2;
            if (index == 3)
              return this._binding3;
            if (index == 4)
              return this._binding4;
            if (index == 5)
              return this._binding5;
            if (index == 6)
              return this._binding6;
            if (index == 7)
              return this._binding7;
            if (index == 8)
              return this._binding8;
            if (index == 9)
              return this._binding9;
            throw new OutOfBoundsAccess(index);
          }
        }, {
          create: function(parent, index, bindings, firstBindingIsComponent, distanceToParent) {
            var bd = [];
            ProtoElementInjector._createDirectiveBindingData(bindings, bd, firstBindingIsComponent);
            ProtoElementInjector._createHostInjectorBindingData(bindings, bd);
            if (firstBindingIsComponent) {
              ProtoElementInjector._createViewInjectorBindingData(bindings, bd);
            }
            return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent);
          },
          _createDirectiveBindingData: function(bindings, bd, firstBindingIsComponent) {
            if (firstBindingIsComponent) {
              ListWrapper.push(bd, new BindingData(bindings[0], LIGHT_DOM_AND_SHADOW_DOM));
              for (var i = 1; i < bindings.length; ++i) {
                ListWrapper.push(bd, new BindingData(bindings[i], LIGHT_DOM));
              }
            } else {
              ListWrapper.forEach(bindings, (function(b) {
                ListWrapper.push(bd, new BindingData(b, LIGHT_DOM));
              }));
            }
          },
          _createHostInjectorBindingData: function(bindings, bd) {
            ListWrapper.forEach(bindings, (function(b) {
              ListWrapper.forEach(b.resolvedHostInjectables, (function(b) {
                ListWrapper.push(bd, new BindingData(ProtoElementInjector._createBinding(b), LIGHT_DOM));
              }));
            }));
          },
          _createViewInjectorBindingData: function(bindings, bd) {
            var db = bindings[0];
            ListWrapper.forEach(db.resolvedViewInjectables, (function(b) {
              return ListWrapper.push(bd, new BindingData(ProtoElementInjector._createBinding(b), SHADOW_DOM));
            }));
          },
          _createBinding: function(b) {
            var deps = ListWrapper.map(b.dependencies, (function(d) {
              return DependencyWithVisibility.createFrom(d);
            }));
            return new ResolvedBinding(b.key, b.factory, deps, b.providedAsPromise);
          }
        });
      }());
      $__export("ProtoElementInjector", ProtoElementInjector);
      ElementInjector = (function($__super) {
        function ElementInjector(proto, parent) {
          $traceurRuntime.superConstructor(ElementInjector).call(this, parent);
          this._proto = proto;
          this._preBuiltObjects = null;
          this._lightDomAppInjector = null;
          this._shadowDomAppInjector = null;
          this._obj0 = null;
          this._obj1 = null;
          this._obj2 = null;
          this._obj3 = null;
          this._obj4 = null;
          this._obj5 = null;
          this._obj6 = null;
          this._obj7 = null;
          this._obj8 = null;
          this._obj9 = null;
          this._constructionCounter = 0;
          this._inheritQueries(parent);
          this._buildQueries();
        }
        return ($traceurRuntime.createClass)(ElementInjector, {
          dehydrate: function() {
            this._host = null;
            this._preBuiltObjects = null;
            this._lightDomAppInjector = null;
            this._shadowDomAppInjector = null;
            var p = this._proto;
            if (p._binding0 instanceof DirectiveBinding && p._binding0.callOnDestroy) {
              this._obj0.onDestroy();
            }
            if (p._binding1 instanceof DirectiveBinding && p._binding1.callOnDestroy) {
              this._obj1.onDestroy();
            }
            if (p._binding2 instanceof DirectiveBinding && p._binding2.callOnDestroy) {
              this._obj2.onDestroy();
            }
            if (p._binding3 instanceof DirectiveBinding && p._binding3.callOnDestroy) {
              this._obj3.onDestroy();
            }
            if (p._binding4 instanceof DirectiveBinding && p._binding4.callOnDestroy) {
              this._obj4.onDestroy();
            }
            if (p._binding5 instanceof DirectiveBinding && p._binding5.callOnDestroy) {
              this._obj5.onDestroy();
            }
            if (p._binding6 instanceof DirectiveBinding && p._binding6.callOnDestroy) {
              this._obj6.onDestroy();
            }
            if (p._binding7 instanceof DirectiveBinding && p._binding7.callOnDestroy) {
              this._obj7.onDestroy();
            }
            if (p._binding8 instanceof DirectiveBinding && p._binding8.callOnDestroy) {
              this._obj8.onDestroy();
            }
            if (p._binding9 instanceof DirectiveBinding && p._binding9.callOnDestroy) {
              this._obj9.onDestroy();
            }
            if (isPresent(this._dynamicallyCreatedComponentBinding) && this._dynamicallyCreatedComponentBinding.callOnDestroy) {
              this._dynamicallyCreatedComponent.onDestroy();
            }
            this._obj0 = null;
            this._obj1 = null;
            this._obj2 = null;
            this._obj3 = null;
            this._obj4 = null;
            this._obj5 = null;
            this._obj6 = null;
            this._obj7 = null;
            this._obj8 = null;
            this._obj9 = null;
            this._dynamicallyCreatedComponent = null;
            this._dynamicallyCreatedComponentBinding = null;
            this._constructionCounter = 0;
          },
          hydrate: function(injector, host, preBuiltObjects) {
            var p = this._proto;
            this._host = host;
            this._lightDomAppInjector = injector;
            this._preBuiltObjects = preBuiltObjects;
            if (p._firstBindingIsComponent) {
              this._shadowDomAppInjector = this._createShadowDomAppInjector(p._binding0, injector);
            }
            this._checkShadowDomAppInjector(this._shadowDomAppInjector);
            if (isPresent(p._keyId0))
              this._getObjByKeyId(p._keyId0, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId1))
              this._getObjByKeyId(p._keyId1, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId2))
              this._getObjByKeyId(p._keyId2, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId3))
              this._getObjByKeyId(p._keyId3, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId4))
              this._getObjByKeyId(p._keyId4, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId5))
              this._getObjByKeyId(p._keyId5, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId6))
              this._getObjByKeyId(p._keyId6, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId7))
              this._getObjByKeyId(p._keyId7, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId8))
              this._getObjByKeyId(p._keyId8, LIGHT_DOM_AND_SHADOW_DOM);
            if (isPresent(p._keyId9))
              this._getObjByKeyId(p._keyId9, LIGHT_DOM_AND_SHADOW_DOM);
          },
          _createShadowDomAppInjector: function(componentDirective, appInjector) {
            if (!ListWrapper.isEmpty(componentDirective.resolvedAppInjectables)) {
              return appInjector.createChildFromResolved(componentDirective.resolvedAppInjectables);
            } else {
              return appInjector;
            }
          },
          dynamicallyCreateComponent: function(componentDirective, parentInjector) {
            this._shadowDomAppInjector = this._createShadowDomAppInjector(componentDirective, parentInjector);
            this._dynamicallyCreatedComponentBinding = componentDirective;
            this._dynamicallyCreatedComponent = this._new(this._dynamicallyCreatedComponentBinding);
            return this._dynamicallyCreatedComponent;
          },
          _checkShadowDomAppInjector: function(shadowDomAppInjector) {
            if (this._proto._firstBindingIsComponent && isBlank(shadowDomAppInjector)) {
              throw new BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
            } else if (!this._proto._firstBindingIsComponent && isPresent(shadowDomAppInjector)) {
              throw new BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
            }
          },
          get: function(token) {
            if (this._isDynamicallyLoadedComponent(token)) {
              return this._dynamicallyCreatedComponent;
            }
            return this._getByKey(Key.get(token), self, false, null);
          },
          _isDynamicallyLoadedComponent: function(token) {
            return isPresent(this._dynamicallyCreatedComponentBinding) && Key.get(token) === this._dynamicallyCreatedComponentBinding.key;
          },
          hasDirective: function(type) {
            return this._getObjByKeyId(Key.get(type).id, LIGHT_DOM_AND_SHADOW_DOM) !== _undefined;
          },
          getEventEmitterAccessors: function() {
            return this._proto.eventEmitterAccessors;
          },
          getHostActionAccessors: function() {
            return this._proto.hostActionAccessors;
          },
          getComponent: function() {
            return this._obj0;
          },
          getElementRef: function() {
            return new ElementRef(new ViewRef(this._preBuiltObjects.view), this._proto.index);
          },
          getViewContainerRef: function() {
            return new ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
          },
          getDynamicallyLoadedComponent: function() {
            return this._dynamicallyCreatedComponent;
          },
          directParent: function() {
            return this._proto.distanceToParent < 2 ? this.parent : null;
          },
          _isComponentKey: function(key) {
            return this._proto._firstBindingIsComponent && isPresent(key) && key.id === this._proto._keyId0;
          },
          _isDynamicallyLoadedComponentKey: function(key) {
            return isPresent(this._dynamicallyCreatedComponentBinding) && key.id === this._dynamicallyCreatedComponentBinding.key.id;
          },
          _new: function(binding) {
            if (this._constructionCounter++ > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER) {
              throw new CyclicDependencyError(binding.key);
            }
            var factory = binding.factory;
            var deps = binding.dependencies;
            var length = deps.length;
            var d0,
                d1,
                d2,
                d3,
                d4,
                d5,
                d6,
                d7,
                d8,
                d9;
            try {
              d0 = length > 0 ? this._getByDependency(deps[0], binding.key) : null;
              d1 = length > 1 ? this._getByDependency(deps[1], binding.key) : null;
              d2 = length > 2 ? this._getByDependency(deps[2], binding.key) : null;
              d3 = length > 3 ? this._getByDependency(deps[3], binding.key) : null;
              d4 = length > 4 ? this._getByDependency(deps[4], binding.key) : null;
              d5 = length > 5 ? this._getByDependency(deps[5], binding.key) : null;
              d6 = length > 6 ? this._getByDependency(deps[6], binding.key) : null;
              d7 = length > 7 ? this._getByDependency(deps[7], binding.key) : null;
              d8 = length > 8 ? this._getByDependency(deps[8], binding.key) : null;
              d9 = length > 9 ? this._getByDependency(deps[9], binding.key) : null;
            } catch (e) {
              if (e instanceof AbstractBindingError)
                e.addKey(binding.key);
              throw e;
            }
            var obj;
            switch (length) {
              case 0:
                obj = factory();
                break;
              case 1:
                obj = factory(d0);
                break;
              case 2:
                obj = factory(d0, d1);
                break;
              case 3:
                obj = factory(d0, d1, d2);
                break;
              case 4:
                obj = factory(d0, d1, d2, d3);
                break;
              case 5:
                obj = factory(d0, d1, d2, d3, d4);
                break;
              case 6:
                obj = factory(d0, d1, d2, d3, d4, d5);
                break;
              case 7:
                obj = factory(d0, d1, d2, d3, d4, d5, d6);
                break;
              case 8:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                break;
              case 9:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                break;
              case 10:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                break;
              default:
                throw ("Directive " + binding.key.token + " can only have up to 10 dependencies.");
            }
            this._addToQueries(obj, binding.key.token);
            return obj;
          },
          _getByDependency: function(dep, requestor) {
            if (!(dep instanceof DirectiveDependency)) {
              return this._getByKey(dep.key, dep.visibility, dep.optional, requestor);
            }
            var dirDep = dep;
            if (isPresent(dirDep.attributeName))
              return this._buildAttribute(dirDep);
            if (isPresent(dirDep.queryDirective))
              return this._findQuery(dirDep.queryDirective).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
              var componentView = this._preBuiltObjects.view.componentChildViews[this._proto.index];
              return componentView.changeDetector.ref;
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
              return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
              return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().protoViewId) {
              if (isBlank(this._preBuiltObjects.protoView)) {
                if (dirDep.optional) {
                  return null;
                }
                throw new NoBindingError(dirDep.key);
              }
              return new ProtoViewRef(this._preBuiltObjects.protoView);
            }
            return this._getByKey(dirDep.key, dirDep.visibility, dirDep.optional, requestor);
          },
          _buildAttribute: function(dep) {
            var attributes = this._proto.attributes;
            if (isPresent(attributes) && MapWrapper.contains(attributes, dep.attributeName)) {
              return MapWrapper.get(attributes, dep.attributeName);
            } else {
              return null;
            }
          },
          _buildQueriesForDeps: function(deps) {
            for (var i = 0; i < deps.length; i++) {
              var dep = deps[i];
              if (isPresent(dep.queryDirective)) {
                this._createQueryRef(dep.queryDirective);
              }
            }
          },
          _createQueryRef: function(directive) {
            var queryList = new QueryList();
            if (isBlank(this._query0)) {
              this._query0 = new QueryRef(directive, queryList, this);
            } else if (isBlank(this._query1)) {
              this._query1 = new QueryRef(directive, queryList, this);
            } else if (isBlank(this._query2)) {
              this._query2 = new QueryRef(directive, queryList, this);
            } else
              throw new QueryError();
          },
          _addToQueries: function(obj, token) {
            if (isPresent(this._query0) && (this._query0.directive === token)) {
              this._query0.list.add(obj);
            }
            if (isPresent(this._query1) && (this._query1.directive === token)) {
              this._query1.list.add(obj);
            }
            if (isPresent(this._query2) && (this._query2.directive === token)) {
              this._query2.list.add(obj);
            }
          },
          _inheritQueries: function(parent) {
            if (isBlank(parent))
              return ;
            if (isPresent(parent._query0)) {
              this._query0 = parent._query0;
            }
            if (isPresent(parent._query1)) {
              this._query1 = parent._query1;
            }
            if (isPresent(parent._query2)) {
              this._query2 = parent._query2;
            }
          },
          _buildQueries: function() {
            if (isBlank(this._proto))
              return ;
            var p = this._proto;
            if (p._binding0 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding0.dependencies);
            }
            if (p._binding1 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding1.dependencies);
            }
            if (p._binding2 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding2.dependencies);
            }
            if (p._binding3 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding3.dependencies);
            }
            if (p._binding4 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding4.dependencies);
            }
            if (p._binding5 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding5.dependencies);
            }
            if (p._binding6 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding6.dependencies);
            }
            if (p._binding7 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding7.dependencies);
            }
            if (p._binding8 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding8.dependencies);
            }
            if (p._binding9 instanceof DirectiveBinding) {
              this._buildQueriesForDeps(p._binding9.dependencies);
            }
          },
          _findQuery: function(token) {
            if (isPresent(this._query0) && this._query0.directive === token) {
              return this._query0;
            }
            if (isPresent(this._query1) && this._query1.directive === token) {
              return this._query1;
            }
            if (isPresent(this._query2) && this._query2.directive === token) {
              return this._query2;
            }
            throw new BaseException(("Cannot find query for directive " + token + "."));
          },
          link: function(parent) {
            parent.addChild(this);
            this._addParentQueries();
          },
          linkAfter: function(parent, prevSibling) {
            parent.addChildAfter(this, prevSibling);
            this._addParentQueries();
          },
          _addParentQueries: function() {
            if (isPresent(this.parent._query0)) {
              this._addQueryToTree(this.parent._query0);
              this.parent._query0.update();
            }
            if (isPresent(this.parent._query1)) {
              this._addQueryToTree(this.parent._query1);
              this.parent._query1.update();
            }
            if (isPresent(this.parent._query2)) {
              this._addQueryToTree(this.parent._query2);
              this.parent._query2.update();
            }
          },
          unlink: function() {
            var queriesToUpDate = [];
            if (isPresent(this.parent._query0)) {
              this._pruneQueryFromTree(this.parent._query0);
              ListWrapper.push(queriesToUpDate, this.parent._query0);
            }
            if (isPresent(this.parent._query1)) {
              this._pruneQueryFromTree(this.parent._query1);
              ListWrapper.push(queriesToUpDate, this.parent._query1);
            }
            if (isPresent(this.parent._query2)) {
              this._pruneQueryFromTree(this.parent._query2);
              ListWrapper.push(queriesToUpDate, this.parent._query2);
            }
            this.remove();
            ListWrapper.forEach(queriesToUpDate, (function(q) {
              return q.update();
            }));
          },
          _pruneQueryFromTree: function(query) {
            this._removeQueryRef(query);
            var child = this._head;
            while (isPresent(child)) {
              child._pruneQueryFromTree(query);
              child = child._next;
            }
          },
          _addQueryToTree: function(query) {
            this._assignQueryRef(query);
            var child = this._head;
            while (isPresent(child)) {
              child._addQueryToTree(query);
              child = child._next;
            }
          },
          _assignQueryRef: function(query) {
            if (isBlank(this._query0)) {
              this._query0 = query;
              return ;
            } else if (isBlank(this._query1)) {
              this._query1 = query;
              return ;
            } else if (isBlank(this._query2)) {
              this._query2 = query;
              return ;
            }
            throw new QueryError();
          },
          _removeQueryRef: function(query) {
            if (this._query0 == query)
              this._query0 = null;
            if (this._query1 == query)
              this._query1 = null;
            if (this._query2 == query)
              this._query2 = null;
          },
          _getByKey: function(key, visibility, optional, requestor) {
            var ei = this;
            var currentVisibility = this._isComponentKey(requestor) ? LIGHT_DOM_AND_SHADOW_DOM : LIGHT_DOM;
            var depth = visibility.depth;
            if (!visibility.shouldIncludeSelf()) {
              depth -= ei._proto.distanceToParent;
              if (isPresent(ei._parent)) {
                ei = ei._parent;
              } else {
                ei = ei._host;
                currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
              }
            }
            while (ei != null && depth >= 0) {
              var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
              if (preBuiltObj !== _undefined)
                return preBuiltObj;
              var dir = ei._getObjByKeyId(key.id, currentVisibility);
              if (dir !== _undefined)
                return dir;
              depth -= ei._proto.distanceToParent;
              if (currentVisibility === SHADOW_DOM)
                break;
              if (isPresent(ei._parent)) {
                ei = ei._parent;
              } else {
                ei = ei._host;
                currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
              }
            }
            if (isPresent(this._host) && this._host._isComponentKey(key)) {
              return this._host.getComponent();
            } else if (isPresent(this._host) && this._host._isDynamicallyLoadedComponentKey(key)) {
              return this._host.getDynamicallyLoadedComponent();
            } else if (optional) {
              return this._appInjector(requestor).getOptional(key);
            } else {
              return this._appInjector(requestor).get(key);
            }
          },
          _appInjector: function(requestor) {
            if (isPresent(requestor) && (this._isComponentKey(requestor) || this._isDynamicallyLoadedComponentKey(requestor))) {
              return this._shadowDomAppInjector;
            } else {
              return this._lightDomAppInjector;
            }
          },
          _getPreBuiltObjectByKeyId: function(keyId) {
            var staticKeys = StaticKeys.instance();
            if (keyId === staticKeys.viewManagerId)
              return this._preBuiltObjects.viewManager;
            return _undefined;
          },
          _getObjByKeyId: function(keyId, visibility) {
            var p = this._proto;
            if (p._keyId0 === keyId && (p._visibility0 & visibility) > 0) {
              if (isBlank(this._obj0)) {
                this._obj0 = this._new(p._binding0);
              }
              return this._obj0;
            }
            if (p._keyId1 === keyId && (p._visibility1 & visibility) > 0) {
              if (isBlank(this._obj1)) {
                this._obj1 = this._new(p._binding1);
              }
              return this._obj1;
            }
            if (p._keyId2 === keyId && (p._visibility2 & visibility) > 0) {
              if (isBlank(this._obj2)) {
                this._obj2 = this._new(p._binding2);
              }
              return this._obj2;
            }
            if (p._keyId3 === keyId && (p._visibility3 & visibility) > 0) {
              if (isBlank(this._obj3)) {
                this._obj3 = this._new(p._binding3);
              }
              return this._obj3;
            }
            if (p._keyId4 === keyId && (p._visibility4 & visibility) > 0) {
              if (isBlank(this._obj4)) {
                this._obj4 = this._new(p._binding4);
              }
              return this._obj4;
            }
            if (p._keyId5 === keyId && (p._visibility5 & visibility) > 0) {
              if (isBlank(this._obj5)) {
                this._obj5 = this._new(p._binding5);
              }
              return this._obj5;
            }
            if (p._keyId6 === keyId && (p._visibility6 & visibility) > 0) {
              if (isBlank(this._obj6)) {
                this._obj6 = this._new(p._binding6);
              }
              return this._obj6;
            }
            if (p._keyId7 === keyId && (p._visibility7 & visibility) > 0) {
              if (isBlank(this._obj7)) {
                this._obj7 = this._new(p._binding7);
              }
              return this._obj7;
            }
            if (p._keyId8 === keyId && (p._visibility8 & visibility) > 0) {
              if (isBlank(this._obj8)) {
                this._obj8 = this._new(p._binding8);
              }
              return this._obj8;
            }
            if (p._keyId9 === keyId && (p._visibility9 & visibility) > 0) {
              if (isBlank(this._obj9)) {
                this._obj9 = this._new(p._binding9);
              }
              return this._obj9;
            }
            return _undefined;
          },
          getDirectiveAtIndex: function(index) {
            if (index == 0)
              return this._obj0;
            if (index == 1)
              return this._obj1;
            if (index == 2)
              return this._obj2;
            if (index == 3)
              return this._obj3;
            if (index == 4)
              return this._obj4;
            if (index == 5)
              return this._obj5;
            if (index == 6)
              return this._obj6;
            if (index == 7)
              return this._obj7;
            if (index == 8)
              return this._obj8;
            if (index == 9)
              return this._obj9;
            throw new OutOfBoundsAccess(index);
          },
          hasInstances: function() {
            return this._constructionCounter > 0;
          },
          isExportingComponent: function() {
            return this._proto.exportComponent;
          },
          isExportingElement: function() {
            return this._proto.exportElement;
          },
          getExportImplicitName: function() {
            return this._proto.exportImplicitName;
          },
          getLightDomAppInjector: function() {
            return this._lightDomAppInjector;
          },
          getShadowDomAppInjector: function() {
            return this._shadowDomAppInjector;
          },
          getHost: function() {
            return this._host;
          },
          getBoundElementIndex: function() {
            return this._proto.index;
          }
        }, {}, $__super);
      }(TreeNode));
      $__export("ElementInjector", ElementInjector);
      OutOfBoundsAccess = (function($__super) {
        function OutOfBoundsAccess(index) {
          $traceurRuntime.superConstructor(OutOfBoundsAccess).call(this);
          this.message = ("Index " + index + " is out-of-bounds.");
        }
        return ($traceurRuntime.createClass)(OutOfBoundsAccess, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      QueryError = (function($__super) {
        function QueryError() {
          $traceurRuntime.superConstructor(QueryError).call(this);
          this.message = 'Only 3 queries can be concurrently active in a template.';
        }
        return ($traceurRuntime.createClass)(QueryError, {toString: function() {
            return this.message;
          }}, {}, $__super);
      }(BaseException));
      QueryRef = (function() {
        function QueryRef(directive, list, originator) {
          this.directive = directive;
          this.list = list;
          this.originator = originator;
        }
        return ($traceurRuntime.createClass)(QueryRef, {
          update: function() {
            var aggregator = [];
            this.visit(this.originator, aggregator);
            this.list.reset(aggregator);
          },
          visit: function(inj, aggregator) {
            if (isBlank(inj))
              return ;
            if (inj.hasDirective(this.directive)) {
              ListWrapper.push(aggregator, inj.get(this.directive));
            }
            var child = inj._head;
            while (isPresent(child)) {
              this.visit(child, aggregator);
              child = child._next;
            }
          }
        }, {});
      }());
    }
  };
});

System.register("angular2/src/core/compiler/compiler", ["angular2/di", "angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/core/compiler/directive_resolver", "angular2/src/core/compiler/view_ref", "angular2/src/core/compiler/element_injector", "angular2/src/core/compiler/template_resolver", "angular2/src/core/compiler/component_url_mapper", "angular2/src/core/compiler/proto_view_factory", "angular2/src/services/url_resolver", "angular2/src/render/api"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/compiler/compiler";
  var __decorate,
      __metadata,
      Binding,
      resolveForwardRef,
      Injectable,
      Type,
      isBlank,
      isPresent,
      BaseException,
      normalizeBlank,
      stringify,
      PromiseWrapper,
      ListWrapper,
      MapWrapper,
      DirectiveResolver,
      ProtoViewRef,
      DirectiveBinding,
      TemplateResolver,
      ComponentUrlMapper,
      ProtoViewFactory,
      UrlResolver,
      renderApi,
      CompilerCache,
      Compiler;
  return {
    setters: [function($__m) {
      Binding = $__m.Binding;
      resolveForwardRef = $__m.resolveForwardRef;
      Injectable = $__m.Injectable;
    }, function($__m) {
      Type = $__m.Type;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      BaseException = $__m.BaseException;
      normalizeBlank = $__m.normalizeBlank;
      stringify = $__m.stringify;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
      MapWrapper = $__m.MapWrapper;
    }, function($__m) {
      DirectiveResolver = $__m.DirectiveResolver;
    }, function($__m) {
      ProtoViewRef = $__m.ProtoViewRef;
    }, function($__m) {
      DirectiveBinding = $__m.DirectiveBinding;
    }, function($__m) {
      TemplateResolver = $__m.TemplateResolver;
    }, function($__m) {
      ComponentUrlMapper = $__m.ComponentUrlMapper;
    }, function($__m) {
      ProtoViewFactory = $__m.ProtoViewFactory;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      renderApi = $__m;
    }],
    execute: function() {
      __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
          return Reflect.decorate(decorators, target, key, desc);
        switch (arguments.length) {
          case 2:
            return decorators.reduceRight(function(o, d) {
              return (d && d(o)) || o;
            }, target);
          case 3:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key)), void 0;
            }, void 0);
          case 4:
            return decorators.reduceRight(function(o, d) {
              return (d && d(target, key, o)) || o;
            }, desc);
        }
      };
      __metadata = (this && this.__metadata) || function(k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
          return Reflect.metadata(k, v);
      };
      CompilerCache = (($traceurRuntime.createClass)(function() {
        this._cache = MapWrapper.create();
      }, {
        set: function(component, protoView) {
          MapWrapper.set(this._cache, component, protoView);
        },
        get: function(component) {
          var result = MapWrapper.get(this._cache, component);
          return normalizeBlank(result);
        },
        clear: function() {
          MapWrapper.clear(this._cache);
        }
      }, {}));
      $__export("CompilerCache", CompilerCache);
      $__export("CompilerCache", CompilerCache = __decorate([Injectable(), __metadata('design:paramtypes', [])], CompilerCache));
      Compiler = (($traceurRuntime.createClass)(function(reader, cache, templateResolver, componentUrlMapper, urlResolver, render, protoViewFactory) {
        this._reader = reader;
        this._compilerCache = cache;
        this._compiling = MapWrapper.create();
        this._templateResolver = templateResolver;
        this._componentUrlMapper = componentUrlMapper;
        this._urlResolver = urlResolver;
        this._appUrl = urlResolver.resolve(null, './');
        this._render = render;
        this._protoViewFactory = protoViewFactory;
      }, {
        _bindDirective: function(directiveTypeOrBinding) {
          if (directiveTypeOrBinding instanceof DirectiveBinding) {
            return directiveTypeOrBinding;
          } else if (directiveTypeOrBinding instanceof Binding) {
            var annotation = this._reader.resolve(directiveTypeOrBinding.token);
            return DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
          } else {
            var annotation$__3 = this._reader.resolve(directiveTypeOrBinding);
            return DirectiveBinding.createFromType(directiveTypeOrBinding, annotation$__3);
          }
        },
        compileInHost: function(componentTypeOrBinding) {
          var $__0 = this;
          var componentBinding = this._bindDirective(componentTypeOrBinding);
          Compiler._assertTypeIsComponent(componentBinding);
          var directiveMetadata = componentBinding.metadata;
          return this._render.compileHost(directiveMetadata).then((function(hostRenderPv) {
            return $__0._compileNestedProtoViews(componentBinding, hostRenderPv, [componentBinding]);
          })).then((function(appProtoView) {
            return new ProtoViewRef(appProtoView);
          }));
        },
        compile: function(component) {
          var componentBinding = this._bindDirective(component);
          Compiler._assertTypeIsComponent(componentBinding);
          var pvOrPromise = this._compile(componentBinding);
          var pvPromise = PromiseWrapper.isPromise(pvOrPromise) ? pvOrPromise : PromiseWrapper.resolve(pvOrPromise);
          return pvPromise.then((function(appProtoView) {
            return new ProtoViewRef(appProtoView);
          }));
        },
        _compile: function(componentBinding) {
          var $__0 = this;
          var component = componentBinding.key.token;
          var protoView = this._compilerCache.get(component);
          if (isPresent(protoView)) {
            return protoView;
          }
          var pvPromise = MapWrapper.get(this._compiling, component);
          if (isPresent(pvPromise)) {
            return pvPromise;
          }
          var template = this._templateResolver.resolve(component);
          if (isBlank(template)) {
            return null;
          }
          var directives = this._flattenDirectives(template);
          for (var i = 0; i < directives.length; i++) {
            if (!Compiler._isValidDirective(directives[i])) {
              throw new BaseException(("Unexpected directive value '" + stringify(directives[i]) + "' on the View of component '" + stringify(component) + "'"));
            }
          }
          var boundDirectives = ListWrapper.map(directives, (function(directive) {
            return $__0._bindDirective(directive);
          }));
          var renderTemplate = this._buildRenderTemplate(component, template, boundDirectives);
          pvPromise = this._render.compile(renderTemplate).then((function(renderPv) {
            return $__0._compileNestedProtoViews(componentBinding, renderPv, boundDirectives);
          }));
          MapWrapper.set(this._compiling, component, pvPromise);
          return pvPromise;
        },
        _compileNestedProtoViews: function(componentBinding, renderPv, directives) {
          var $__0 = this;
          var protoViews = this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, directives);
          var protoView = protoViews[0];
          if (renderPv.type === renderApi.ProtoViewDto.COMPONENT_VIEW_TYPE && isPresent(componentBinding)) {
            var component = componentBinding.key.token;
            this._compilerCache.set(component, protoView);
            MapWrapper.delete(this._compiling, component);
          }
          var nestedPVPromises = [];
          ListWrapper.forEach(this._collectComponentElementBinders(protoViews), (function(elementBinder) {
            var nestedComponent = elementBinder.componentDirective;
            var elementBinderDone = (function(nestedPv) {
              elementBinder.nestedProtoView = nestedPv;
            });
            var nestedCall = $__0._compile(nestedComponent);
            if (PromiseWrapper.isPromise(nestedCall)) {
              ListWrapper.push(nestedPVPromises, nestedCall.then(elementBinderDone));
            } else if (isPresent(nestedCall)) {
              elementBinderDone(nestedCall);
            }
          }));
          if (nestedPVPromises.length > 0) {
            return PromiseWrapper.all(nestedPVPromises).then((function(_) {
              return protoView;
            }));
          } else {
            return protoView;
          }
        },
        _collectComponentElementBinders: function(protoViews) {
          var componentElementBinders = [];
          ListWrapper.forEach(protoViews, (function(protoView) {
            ListWrapper.forEach(protoView.elementBinders, (function(elementBinder) {
              if (isPresent(elementBinder.componentDirective)) {
                ListWrapper.push(componentElementBinders, elementBinder);
              }
            }));
          }));
          return componentElementBinders;
        },
        _buildRenderTemplate: function(component, view, directives) {
          var componentUrl = this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
          var templateAbsUrl = null;
          if (isPresent(view.templateUrl)) {
            templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
          } else if (isPresent(view.template)) {
            templateAbsUrl = componentUrl;
          }
          return new renderApi.ViewDefinition({
            componentId: stringify(component),
            absUrl: templateAbsUrl,
            template: view.template,
            directives: ListWrapper.map(directives, (function(directiveBinding) {
              return directiveBinding.metadata;
            }))
          });
        },
        _flattenDirectives: function(template) {
          if (isBlank(template.directives))
            return [];
          var directives = [];
          this._flattenList(template.directives, directives);
          return directives;
        },
        _flattenList: function(tree, out) {
          for (var i = 0; i < tree.length; i++) {
            var item = resolveForwardRef(tree[i]);
            if (ListWrapper.isList(item)) {
              this._flattenList(item, out);
            } else {
              ListWrapper.push(out, item);
            }
          }
        }
      }, {
        _isValidDirective: function(value) {
          return isPresent(value) && (value instanceof Type || value instanceof Binding);
        },
        _assertTypeIsComponent: function(directiveBinding) {
          if (directiveBinding.metadata.type !== renderApi.DirectiveMetadata.COMPONENT_TYPE) {
            throw new BaseException(("Could not load '" + stringify(directiveBinding.key.token) + "' because it is not a component."));
          }
        }
      }));
      $__export("Compiler", Compiler);
      $__export("Compiler", Compiler = __decorate([Injectable(), __metadata('design:paramtypes', [DirectiveResolver, CompilerCache, TemplateResolver, ComponentUrlMapper, UrlResolver, renderApi.RenderCompiler, ProtoViewFactory])], Compiler));
    }
  };
});

System.register("angular2/src/core/application", ["angular2/di", "angular2/src/facade/lang", "angular2/src/dom/browser_adapter", "angular2/src/dom/dom_adapter", "angular2/src/core/compiler/compiler", "angular2/src/reflection/reflection", "angular2/change_detection", "angular2/src/core/exception_handler", "angular2/src/render/dom/compiler/template_loader", "angular2/src/core/compiler/template_resolver", "angular2/src/core/compiler/directive_resolver", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/core/zone/ng_zone", "angular2/src/core/life_cycle/life_cycle", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", "angular2/src/services/xhr", "angular2/src/services/xhr_impl", "angular2/src/render/dom/events/event_manager", "angular2/src/render/dom/events/key_events", "angular2/src/render/dom/events/hammer_gestures", "angular2/src/core/compiler/component_url_mapper", "angular2/src/services/url_resolver", "angular2/src/render/dom/shadow_dom/style_url_resolver", "angular2/src/render/dom/shadow_dom/style_inliner", "angular2/src/core/compiler/dynamic_component_loader", "angular2/src/core/testability/testability", "angular2/src/core/compiler/view_pool", "angular2/src/core/compiler/view_manager", "angular2/src/core/compiler/view_manager_utils", "angular2/src/core/compiler/proto_view_factory", "angular2/src/render/api", "angular2/src/render/dom/dom_renderer", "angular2/src/render/dom/view/view", "angular2/src/render/dom/compiler/compiler", "angular2/src/core/compiler/view_ref", "angular2/src/core/application_tokens"], function($__export) {
  "use strict";
  var __moduleName = "angular2/src/core/application";
  var Injector,
      bind,
      isBlank,
      isPresent,
      assertionsEnabled,
      BrowserDomAdapter,
      DOM,
      Compiler,
      CompilerCache,
      Reflector,
      reflector,
      Parser,
      Lexer,
      ChangeDetection,
      DynamicChangeDetection,
      PipeRegistry,
      defaultPipeRegistry,
      ExceptionHandler,
      TemplateLoader,
      TemplateResolver,
      DirectiveResolver,
      ListWrapper,
      PromiseWrapper,
      NgZone,
      LifeCycle,
      ShadowDomStrategy,
      EmulatedUnscopedShadowDomStrategy,
      XHR,
      XHRImpl,
      EventManager,
      DomEventsPlugin,
      KeyEventsPlugin,
      HammerGesturesPlugin,
      ComponentUrlMapper,
      UrlResolver,
      StyleUrlResolver,
      StyleInliner,
      DynamicComponentLoader,
      TestabilityRegistry,
      Testability,
      AppViewPool,
      APP_VIEW_POOL_CAPACITY,
      AppViewManager,
      AppViewManagerUtils,
      ProtoViewFactory,
      Renderer,
      RenderCompiler,
      DomRenderer,
      DOCUMENT_TOKEN,
      resolveInternalDomView,
      DefaultDomCompiler,
      internalView,
      appComponentRefToken,
      appComponentTypeToken,
      _rootInjector,
      _rootBindings,
      ApplicationRef;
  function _injectorBindings(appComponentType) {
    return [bind(DOCUMENT_TOKEN).toValue(DOM.defaultDoc()), bind(appComponentTypeToken).toValue(appComponentType), bind(appComponentRefToken).toAsyncFactory((function(dynamicComponentLoader, injector, testability, registry) {
      return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then((function(componentRef) {
        var domView = resolveInternalDomView(componentRef.hostView.render);
        registry.registerApplication(domView.boundElements[0], testability);
        return componentRef;
      }));
    }), [DynamicComponentLoader, Injector, Testability, TestabilityRegistry]), bind(appComponentType).toFactory((function(ref) {
      return ref.instance;
    }), [appComponentRefToken]), bind(LifeCycle).toFactory((function(exceptionHandler) {
      return new LifeCycle(exceptionHandler, null, assertionsEnabled());
    }), [ExceptionHandler]), bind(EventManager).toFactory((function(ngZone) {
      var plugins = [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
      return new EventManager(plugins, ngZone);
    }), [NgZone]), bind(ShadowDomStrategy).toFactory((function(styleUrlResolver, doc) {
      return new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, doc.head);
    }), [StyleUrlResolver, DOCUMENT_TOKEN]), bind(DomRenderer).toFactory((function(eventManager, shadowDomStrategy, doc) {
      return new DomRenderer(eventManager, shadowDomStrategy, doc);
    }), [EventManager, ShadowDomStrategy, DOCUMENT_TOKEN]), DefaultDomCompiler, bind(Renderer).toAlias(DomRenderer), bind(RenderCompiler).toAlias(DefaultDomCompiler), ProtoViewFactory, bind(AppViewPool).toFactory((function(capacity) {
      return new AppViewPool(capacity);
    }), [APP_VIEW_POOL_CAPACITY]), bind(APP_VIEW_POOL_CAPACITY).toValue(10000), AppViewManager, AppViewManagerUtils, Compiler, CompilerCache, TemplateResolver, bind(PipeRegistry).toValue(defaultPipeRegistry), bind(ChangeDetection).toClass(DynamicChangeDetection), TemplateLoader, DirectiveResolver, Parser, Lexer, ExceptionHandler, bind(XHR).toValue(new XHRImpl()), ComponentUrlMapper, UrlResolver, StyleUrlResolver, StyleInliner, DynamicComponentLoader, Testability];
  }
  function _createNgZone(givenReporter) {
    var defaultErrorReporter = (function(exception, stackTrace) {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      DOM.logError((exception + "\n\n" + longStackTrace));
      throw exception;
    });
    var reporter = isPresent(givenReporter) ? givenReporter : defaultErrorReporter;
    var zone = new NgZone({enableLongStackTrace: assertionsEnabled()});
    zone.initCallbacks({onErrorHandler: reporter});
    return zone;
  }
  function bootstrap(appComponentType) {
    var componentInjectableBindings = arguments[1] !== (void 0) ? arguments[1] : null;
    var errorReporter = arguments[2] !== (void 0) ? arguments[2] : null;
    BrowserDomAdapter.makeCurrent();
    var bootstrapProcess = PromiseWrapper.completer();
    var zone = _createNgZone(errorReporter);
    zone.run((function() {
      var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);
      PromiseWrapper.then(appInjector.asyncGet(appComponentRefToken), (function(componentRef) {
        var appChangeDetector = internalView(componentRef.hostView).changeDetector;
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick();
        bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
      }), (function(err, stackTrace) {
        bootstrapProcess.reject(err, stackTrace);
      }));
    }));
    return bootstrapProcess.promise;
  }
  function _createAppInjector(appComponentType, bindings, zone) {
    if (isBlank(_rootInjector))
      _rootInjector = Injector.resolveAndCreate(_rootBindings);
    var mergedBindings = isPresent(bindings) ? ListWrapper.concat(_injectorBindings(appComponentType), bindings) : _injectorBindings(appComponentType);
    ListWrapper.push(mergedBindings, bind(NgZone).toValue(zone));
    return _rootInjector.resolveAndCreateChild(mergedBindings);
  }
  $__export("bootstrap", bootstrap);
  return {
    setters: [function($__m) {
      Injector = $__m.Injector;
      bind = $__m.bind;
    }, function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
      assertionsEnabled = $__m.assertionsEnabled;
    }, function($__m) {
      BrowserDomAdapter = $__m.BrowserDomAdapter;
    }, function($__m) {
      DOM = $__m.DOM;
    }, function($__m) {
      Compiler = $__m.Compiler;
      CompilerCache = $__m.CompilerCache;
    }, function($__m) {
      Reflector = $__m.Reflector;
      reflector = $__m.reflector;
    }, function($__m) {
      Parser = $__m.Parser;
      Lexer = $__m.Lexer;
      ChangeDetection = $__m.ChangeDetection;
      DynamicChangeDetection = $__m.DynamicChangeDetection;
      PipeRegistry = $__m.PipeRegistry;
      defaultPipeRegistry = $__m.defaultPipeRegistry;
    }, function($__m) {
      ExceptionHandler = $__m.ExceptionHandler;
    }, function($__m) {
      TemplateLoader = $__m.TemplateLoader;
    }, function($__m) {
      TemplateResolver = $__m.TemplateResolver;
    }, function($__m) {
      DirectiveResolver = $__m.DirectiveResolver;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      PromiseWrapper = $__m.PromiseWrapper;
    }, function($__m) {
      NgZone = $__m.NgZone;
    }, function($__m) {
      LifeCycle = $__m.LifeCycle;
    }, function($__m) {
      ShadowDomStrategy = $__m.ShadowDomStrategy;
    }, function($__m) {
      EmulatedUnscopedShadowDomStrategy = $__m.EmulatedUnscopedShadowDomStrategy;
    }, function($__m) {
      XHR = $__m.XHR;
    }, function($__m) {
      XHRImpl = $__m.XHRImpl;
    }, function($__m) {
      EventManager = $__m.EventManager;
      DomEventsPlugin = $__m.DomEventsPlugin;
    }, function($__m) {
      KeyEventsPlugin = $__m.KeyEventsPlugin;
    }, function($__m) {
      HammerGesturesPlugin = $__m.HammerGesturesPlugin;
    }, function($__m) {
      ComponentUrlMapper = $__m.ComponentUrlMapper;
    }, function($__m) {
      UrlResolver = $__m.UrlResolver;
    }, function($__m) {
      StyleUrlResolver = $__m.StyleUrlResolver;
    }, function($__m) {
      StyleInliner = $__m.StyleInliner;
    }, function($__m) {
      DynamicComponentLoader = $__m.DynamicComponentLoader;
    }, function($__m) {
      TestabilityRegistry = $__m.TestabilityRegistry;
      Testability = $__m.Testability;
    }, function($__m) {
      AppViewPool = $__m.AppViewPool;
      APP_VIEW_POOL_CAPACITY = $__m.APP_VIEW_POOL_CAPACITY;
    }, function($__m) {
      AppViewManager = $__m.AppViewManager;
    }, function($__m) {
      AppViewManagerUtils = $__m.AppViewManagerUtils;
    }, function($__m) {
      ProtoViewFactory = $__m.ProtoViewFactory;
    }, function($__m) {
      Renderer = $__m.Renderer;
      RenderCompiler = $__m.RenderCompiler;
    }, function($__m) {
      DomRenderer = $__m.DomRenderer;
      DOCUMENT_TOKEN = $__m.DOCUMENT_TOKEN;
    }, function($__m) {
      resolveInternalDomView = $__m.resolveInternalDomView;
    }, function($__m) {
      DefaultDomCompiler = $__m.DefaultDomCompiler;
    }, function($__m) {
      internalView = $__m.internalView;
    }, function($__m) {
      appComponentRefToken = $__m.appComponentRefToken;
      appComponentTypeToken = $__m.appComponentTypeToken;
    }],
    execute: function() {
      _rootBindings = [bind(Reflector).toValue(reflector), TestabilityRegistry];
      ApplicationRef = (function() {
        function ApplicationRef(hostComponent, hostComponentType, injector) {
          this._hostComponent = hostComponent;
          this._injector = injector;
          this._hostComponentType = hostComponentType;
        }
        return ($traceurRuntime.createClass)(ApplicationRef, {
          get hostComponentType() {
            return this._hostComponentType;
          },
          get hostComponent() {
            return this._hostComponent.instance;
          },
          dispose: function() {
            return this._hostComponent.dispose();
          },
          get injector() {
            return this._injector;
          }
        }, {});
      }());
      $__export("ApplicationRef", ApplicationRef);
    }
  };
});

System.register("angular2/core", ["angular2/src/core/annotations/visibility", "angular2/src/core/annotations/view", "angular2/src/core/application", "angular2/src/core/application_tokens", "angular2/src/core/annotations/di", "angular2/src/core/compiler/query_list", "angular2/src/core/compiler/compiler", "angular2/src/render/dom/compiler/template_loader", "angular2/src/render/dom/shadow_dom/shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy", "angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy", "angular2/src/core/compiler/dynamic_component_loader", "angular2/src/core/compiler/view_ref", "angular2/src/core/compiler/view_container_ref", "angular2/src/core/compiler/element_ref"], function($__export) {
  "use strict";
  var __moduleName = "angular2/core";
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("ViewRef", $__m.ViewRef);
      $__export("ProtoViewRef", $__m.ProtoViewRef);
    }, function($__m) {
      $__export("ViewContainerRef", $__m.ViewContainerRef);
    }, function($__m) {
      $__export("ElementRef", $__m.ElementRef);
    }],
    execute: function() {}
  };
});

System.register("angular2/angular2", ["angular2/change_detection", "angular2/core", "angular2/annotations", "angular2/directives", "angular2/forms", "angular2/di", "angular2/src/facade/async", "angular2/src/render/api", "angular2/src/render/dom/dom_renderer"], function($__export) {
  "use strict";
  var __moduleName = "angular2/angular2";
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("Observable", $__m.Observable);
      $__export("EventEmitter", $__m.EventEmitter);
    }, function($__m) {
      Object.keys($__m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, $__m[p]);
      });
    }, function($__m) {
      $__export("DomRenderer", $__m.DomRenderer);
      $__export("DOCUMENT_TOKEN", $__m.DOCUMENT_TOKEN);
    }],
    execute: function() {}
  };
});

//# sourceMappingURLDisabled=angular2.dev.js.map
System.config({"paths":{"*":"*.js","angular2/*":"angular2/*"}});
