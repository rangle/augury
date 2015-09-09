(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';/// <reference path="../angular2/typings/node/node.d.ts" />
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var di_1 = require('angular2/src/core/di');
var common_1 = require('./common');
__export(require('./common'));
var selenium_webdriver_adapter_1 = require('./src/webdriver/selenium_webdriver_adapter');
exports.SeleniumWebDriverAdapter = selenium_webdriver_adapter_1.SeleniumWebDriverAdapter;
var fs = require('fs');
// TODO(tbosch): right now we bind the `writeFile` method
// in benchpres/benchpress.es6. This does not work for Dart,
// find another way...
// Note: Can't do the `require` call in a facade as it can't be loaded into the browser
// for our unit tests via karma.
common_1.Options.DEFAULT_BINDINGS.push(di_1.bind(common_1.Options.WRITE_FILE).toValue(writeFile));
function writeFile(filename, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, content, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

},{"./common":2,"./src/webdriver/selenium_webdriver_adapter":25,"angular2/src/core/di":26,"fs":undefined}],2:[function(require,module,exports){
'use strict';var sampler_1 = require('./src/sampler');
exports.Sampler = sampler_1.Sampler;
exports.SampleState = sampler_1.SampleState;
var metric_1 = require('./src/metric');
exports.Metric = metric_1.Metric;
var validator_1 = require('./src/validator');
exports.Validator = validator_1.Validator;
var reporter_1 = require('./src/reporter');
exports.Reporter = reporter_1.Reporter;
var web_driver_extension_1 = require('./src/web_driver_extension');
exports.WebDriverExtension = web_driver_extension_1.WebDriverExtension;
exports.PerfLogFeatures = web_driver_extension_1.PerfLogFeatures;
var web_driver_adapter_1 = require('./src/web_driver_adapter');
exports.WebDriverAdapter = web_driver_adapter_1.WebDriverAdapter;
var size_validator_1 = require('./src/validator/size_validator');
exports.SizeValidator = size_validator_1.SizeValidator;
var regression_slope_validator_1 = require('./src/validator/regression_slope_validator');
exports.RegressionSlopeValidator = regression_slope_validator_1.RegressionSlopeValidator;
var console_reporter_1 = require('./src/reporter/console_reporter');
exports.ConsoleReporter = console_reporter_1.ConsoleReporter;
var json_file_reporter_1 = require('./src/reporter/json_file_reporter');
exports.JsonFileReporter = json_file_reporter_1.JsonFileReporter;
var sample_description_1 = require('./src/sample_description');
exports.SampleDescription = sample_description_1.SampleDescription;
var perflog_metric_1 = require('./src/metric/perflog_metric');
exports.PerflogMetric = perflog_metric_1.PerflogMetric;
var chrome_driver_extension_1 = require('./src/webdriver/chrome_driver_extension');
exports.ChromeDriverExtension = chrome_driver_extension_1.ChromeDriverExtension;
var firefox_driver_extension_1 = require('./src/webdriver/firefox_driver_extension');
exports.FirefoxDriverExtension = firefox_driver_extension_1.FirefoxDriverExtension;
var ios_driver_extension_1 = require('./src/webdriver/ios_driver_extension');
exports.IOsDriverExtension = ios_driver_extension_1.IOsDriverExtension;
var runner_1 = require('./src/runner');
exports.Runner = runner_1.Runner;
var common_options_1 = require('./src/common_options');
exports.Options = common_options_1.Options;
var measure_values_1 = require('./src/measure_values');
exports.MeasureValues = measure_values_1.MeasureValues;
var multi_metric_1 = require('./src/metric/multi_metric');
exports.MultiMetric = multi_metric_1.MultiMetric;
var multi_reporter_1 = require('./src/reporter/multi_reporter');
exports.MultiReporter = multi_reporter_1.MultiReporter;
var di_1 = require('angular2/src/core/di');
exports.bind = di_1.bind;
exports.Injector = di_1.Injector;
exports.OpaqueToken = di_1.OpaqueToken;

},{"./src/common_options":4,"./src/measure_values":5,"./src/metric":6,"./src/metric/multi_metric":7,"./src/metric/perflog_metric":8,"./src/reporter":9,"./src/reporter/console_reporter":10,"./src/reporter/json_file_reporter":11,"./src/reporter/multi_reporter":12,"./src/runner":13,"./src/sample_description":14,"./src/sampler":15,"./src/validator":17,"./src/validator/regression_slope_validator":18,"./src/validator/size_validator":19,"./src/web_driver_adapter":20,"./src/web_driver_extension":21,"./src/webdriver/chrome_driver_extension":22,"./src/webdriver/firefox_driver_extension":23,"./src/webdriver/ios_driver_extension":24,"angular2/src/core/di":26}],3:[function(require,module,exports){
'use strict';require('reflect-metadata');
require('traceur/bin/traceur-runtime');
module.exports = require('./benchpress.js');
// when bundling benchpress to one file, this is used
// for getting exports out of browserify's scope.
global.__benchpressExports = module.exports;

},{"./benchpress.js":1,"reflect-metadata":undefined,"traceur/bin/traceur-runtime":undefined}],4:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
var Options = (function () {
    function Options() {
    }
    Object.defineProperty(Options, "DEFAULT_BINDINGS", {
        get: function () { return _DEFAULT_BINDINGS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "SAMPLE_ID", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _SAMPLE_ID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "DEFAULT_DESCRIPTION", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _DEFAULT_DESCRIPTION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "SAMPLE_DESCRIPTION", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _SAMPLE_DESCRIPTION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "FORCE_GC", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _FORCE_GC; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "PREPARE", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _PREPARE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "EXECUTE", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _EXECUTE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "CAPABILITIES", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _CAPABILITIES; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "USER_AGENT", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _USER_AGENT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "NOW", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _NOW; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "WRITE_FILE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _WRITE_FILE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "MICRO_METRICS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _MICRO_METRICS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "CAPTURE_FRAMES", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _CAPTURE_FRAMES; },
        enumerable: true,
        configurable: true
    });
    return Options;
})();
exports.Options = Options;
var _SAMPLE_ID = new di_1.OpaqueToken('Options.sampleId');
var _DEFAULT_DESCRIPTION = new di_1.OpaqueToken('Options.defaultDescription');
var _SAMPLE_DESCRIPTION = new di_1.OpaqueToken('Options.sampleDescription');
var _FORCE_GC = new di_1.OpaqueToken('Options.forceGc');
var _PREPARE = new di_1.OpaqueToken('Options.prepare');
var _EXECUTE = new di_1.OpaqueToken('Options.execute');
var _CAPABILITIES = new di_1.OpaqueToken('Options.capabilities');
var _USER_AGENT = new di_1.OpaqueToken('Options.userAgent');
var _MICRO_METRICS = new di_1.OpaqueToken('Options.microMetrics');
var _NOW = new di_1.OpaqueToken('Options.now');
var _WRITE_FILE = new di_1.OpaqueToken('Options.writeFile');
var _CAPTURE_FRAMES = new di_1.OpaqueToken('Options.frameCapture');
var _DEFAULT_BINDINGS = [
    di_1.bind(_DEFAULT_DESCRIPTION)
        .toValue({}),
    di_1.bind(_SAMPLE_DESCRIPTION).toValue({}),
    di_1.bind(_FORCE_GC).toValue(false),
    di_1.bind(_PREPARE).toValue(false),
    di_1.bind(_MICRO_METRICS).toValue({}),
    di_1.bind(_NOW).toValue(function () { return lang_1.DateWrapper.now(); }),
    di_1.bind(_CAPTURE_FRAMES).toValue(false)
];

},{"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],5:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
var MeasureValues = (function () {
    function MeasureValues(runIndex, timeStamp, values) {
        this.runIndex = runIndex;
        this.timeStamp = timeStamp;
        this.values = values;
    }
    MeasureValues.prototype.toJson = function () {
        return {
            'timeStamp': lang_1.DateWrapper.toJson(this.timeStamp),
            'runIndex': this.runIndex,
            'values': this.values
        };
    };
    return MeasureValues;
})();
exports.MeasureValues = MeasureValues;

},{"angular2/src/core/facade/lang":38}],6:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
/**
 * A metric is measures values
 */
var Metric = (function () {
    function Metric() {
    }
    Metric.bindTo = function (delegateToken) {
        return [di_1.bind(Metric).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    /**
     * Starts measuring
     */
    Metric.prototype.beginMeasure = function () { throw new lang_1.BaseException('NYI'); };
    /**
     * Ends measuring and reports the data
     * since the begin call.
     * @param restart: Whether to restart right after this.
     */
    Metric.prototype.endMeasure = function (restart) { throw new lang_1.BaseException('NYI'); };
    /**
     * Describes the metrics provided by this metric implementation.
     * (e.g. units, ...)
     */
    Metric.prototype.describe = function () { throw new lang_1.BaseException('NYI'); };
    Metric = __decorate([
        lang_1.ABSTRACT(), 
        __metadata('design:paramtypes', [])
    ], Metric);
    return Metric;
})();
exports.Metric = Metric;

},{"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],7:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/core/facade/collection');
var async_1 = require('angular2/src/core/facade/async');
var metric_1 = require('../metric');
var MultiMetric = (function (_super) {
    __extends(MultiMetric, _super);
    function MultiMetric(_metrics) {
        _super.call(this);
        this._metrics = _metrics;
    }
    MultiMetric.createBindings = function (childTokens) {
        return [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return collection_1.ListWrapper.map(childTokens, function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(MultiMetric).toFactory(function (children) { return new MultiMetric(children); }, [_CHILDREN])
        ];
    };
    /**
     * Starts measuring
     */
    MultiMetric.prototype.beginMeasure = function () {
        return async_1.PromiseWrapper.all(collection_1.ListWrapper.map(this._metrics, function (metric) { return metric.beginMeasure(); }));
    };
    /**
     * Ends measuring and reports the data
     * since the begin call.
     * @param restart: Whether to restart right after this.
     */
    MultiMetric.prototype.endMeasure = function (restart) {
        return async_1.PromiseWrapper.all(collection_1.ListWrapper.map(this._metrics, function (metric) { return metric.endMeasure(restart); }))
            .then(function (values) { return mergeStringMaps(values); });
    };
    /**
     * Describes the metrics provided by this metric implementation.
     * (e.g. units, ...)
     */
    MultiMetric.prototype.describe = function () {
        return mergeStringMaps(this._metrics.map(function (metric) { return metric.describe(); }));
    };
    return MultiMetric;
})(metric_1.Metric);
exports.MultiMetric = MultiMetric;
function mergeStringMaps(maps) {
    var result = {};
    collection_1.ListWrapper.forEach(maps, function (map) {
        collection_1.StringMapWrapper.forEach(map, function (value, prop) { result[prop] = value; });
    });
    return result;
}
var _CHILDREN = new di_1.OpaqueToken('MultiMetric.children');

},{"../metric":6,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/collection":37}],8:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var async_1 = require('angular2/src/core/facade/async');
var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var di_1 = require('angular2/src/core/di');
var web_driver_extension_1 = require('../web_driver_extension');
var metric_1 = require('../metric');
var common_options_1 = require('../common_options');
/**
 * A metric that reads out the performance log
 */
var PerflogMetric = (function (_super) {
    __extends(PerflogMetric, _super);
    /**
     * @param driverExtension
     * @param setTimeout
     * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
     **/
    function PerflogMetric(_driverExtension, _setTimeout, _microMetrics, _forceGc, _captureFrames) {
        _super.call(this);
        this._driverExtension = _driverExtension;
        this._setTimeout = _setTimeout;
        this._microMetrics = _microMetrics;
        this._forceGc = _forceGc;
        this._captureFrames = _captureFrames;
        this._remainingEvents = [];
        this._measureCount = 0;
        this._perfLogFeatures = _driverExtension.perfLogFeatures();
    }
    Object.defineProperty(PerflogMetric, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PerflogMetric, "SET_TIMEOUT", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SET_TIMEOUT; },
        enumerable: true,
        configurable: true
    });
    PerflogMetric.prototype.describe = function () {
        var res = {
            'scriptTime': 'script execution time in ms, including gc and render',
            'pureScriptTime': 'script execution time in ms, without gc nor render'
        };
        if (this._perfLogFeatures.render) {
            res['renderTime'] = 'render time in ms';
        }
        if (this._perfLogFeatures.gc) {
            res['gcTime'] = 'gc time in ms';
            res['gcAmount'] = 'gc amount in kbytes';
            res['majorGcTime'] = 'time of major gcs in ms';
            if (this._forceGc) {
                res['forcedGcTime'] = 'forced gc time in ms';
                res['forcedGcAmount'] = 'forced gc amount in kbytes';
            }
        }
        if (this._captureFrames) {
            if (!this._perfLogFeatures.frameCapture) {
                var warningMsg = 'WARNING: Metric requested, but not supported by driver';
                // using dot syntax for metric name to keep them grouped together in console reporter
                res['frameTime.mean'] = warningMsg;
                res['frameTime.worst'] = warningMsg;
                res['frameTime.best'] = warningMsg;
                res['frameTime.smooth'] = warningMsg;
            }
            else {
                res['frameTime.mean'] = 'mean frame time in ms (target: 16.6ms for 60fps)';
                res['frameTime.worst'] = 'worst frame time in ms';
                res['frameTime.best'] = 'best frame time in ms';
                res['frameTime.smooth'] = 'percentage of frames that hit 60fps';
            }
        }
        collection_1.StringMapWrapper.forEach(this._microMetrics, function (desc, name) { collection_1.StringMapWrapper.set(res, name, desc); });
        return res;
    };
    PerflogMetric.prototype.beginMeasure = function () {
        var _this = this;
        var resultPromise = async_1.PromiseWrapper.resolve(null);
        if (this._forceGc) {
            resultPromise = resultPromise.then(function (_) { return _this._driverExtension.gc(); });
        }
        return resultPromise.then(function (_) { return _this._beginMeasure(); });
    };
    PerflogMetric.prototype.endMeasure = function (restart) {
        if (this._forceGc) {
            return this._endPlainMeasureAndMeasureForceGc(restart);
        }
        else {
            return this._endMeasure(restart);
        }
    };
    PerflogMetric.prototype._endPlainMeasureAndMeasureForceGc = function (restartMeasure) {
        var _this = this;
        return this._endMeasure(true).then(function (measureValues) {
            // disable frame capture for measurments during forced gc
            var originalFrameCaptureValue = _this._captureFrames;
            _this._captureFrames = false;
            return _this._driverExtension.gc()
                .then(function (_) { return _this._endMeasure(restartMeasure); })
                .then(function (forceGcMeasureValues) {
                _this._captureFrames = originalFrameCaptureValue;
                collection_1.StringMapWrapper.set(measureValues, 'forcedGcTime', forceGcMeasureValues['gcTime']);
                collection_1.StringMapWrapper.set(measureValues, 'forcedGcAmount', forceGcMeasureValues['gcAmount']);
                return measureValues;
            });
        });
    };
    PerflogMetric.prototype._beginMeasure = function () {
        return this._driverExtension.timeBegin(this._markName(this._measureCount++));
    };
    PerflogMetric.prototype._endMeasure = function (restart) {
        var _this = this;
        var markName = this._markName(this._measureCount - 1);
        var nextMarkName = restart ? this._markName(this._measureCount++) : null;
        return this._driverExtension.timeEnd(markName, nextMarkName)
            .then(function (_) { return _this._readUntilEndMark(markName); });
    };
    PerflogMetric.prototype._readUntilEndMark = function (markName, loopCount, startEvent) {
        var _this = this;
        if (loopCount === void 0) { loopCount = 0; }
        if (startEvent === void 0) { startEvent = null; }
        if (loopCount > _MAX_RETRY_COUNT) {
            throw new lang_1.BaseException("Tried too often to get the ending mark: " + loopCount);
        }
        return this._driverExtension.readPerfLog().then(function (events) {
            _this._addEvents(events);
            var result = _this._aggregateEvents(_this._remainingEvents, markName);
            if (lang_1.isPresent(result)) {
                _this._remainingEvents = events;
                return result;
            }
            var completer = async_1.PromiseWrapper.completer();
            _this._setTimeout(function () { return completer.resolve(_this._readUntilEndMark(markName, loopCount + 1)); }, 100);
            return completer.promise;
        });
    };
    PerflogMetric.prototype._addEvents = function (events) {
        var _this = this;
        var needSort = false;
        collection_1.ListWrapper.forEach(events, function (event) {
            if (lang_1.StringWrapper.equals(event['ph'], 'X')) {
                needSort = true;
                var startEvent = {};
                var endEvent = {};
                collection_1.StringMapWrapper.forEach(event, function (value, prop) {
                    startEvent[prop] = value;
                    endEvent[prop] = value;
                });
                startEvent['ph'] = 'B';
                endEvent['ph'] = 'E';
                endEvent['ts'] = startEvent['ts'] + startEvent['dur'];
                _this._remainingEvents.push(startEvent);
                _this._remainingEvents.push(endEvent);
            }
            else {
                _this._remainingEvents.push(event);
            }
        });
        if (needSort) {
            // Need to sort because of the ph==='X' events
            collection_1.ListWrapper.sort(this._remainingEvents, function (a, b) {
                var diff = a['ts'] - b['ts'];
                return diff > 0 ? 1 : diff < 0 ? -1 : 0;
            });
        }
    };
    PerflogMetric.prototype._aggregateEvents = function (events, markName) {
        var _this = this;
        var result = { 'scriptTime': 0, 'pureScriptTime': 0 };
        if (this._perfLogFeatures.gc) {
            result['gcTime'] = 0;
            result['majorGcTime'] = 0;
            result['gcAmount'] = 0;
        }
        if (this._perfLogFeatures.render) {
            result['renderTime'] = 0;
        }
        if (this._captureFrames) {
            result['frameTime.mean'] = 0;
            result['frameTime.best'] = 0;
            result['frameTime.worst'] = 0;
            result['frameTime.smooth'] = 0;
        }
        collection_1.StringMapWrapper.forEach(this._microMetrics, function (desc, name) { result[name] = 0; });
        var markStartEvent = null;
        var markEndEvent = null;
        var gcTimeInScript = 0;
        var renderTimeInScript = 0;
        var frameTimestamps = [];
        var frameTimes = [];
        var frameCaptureStartEvent = null;
        var frameCaptureEndEvent = null;
        var intervalStarts = {};
        var intervalStartCount = {};
        events.forEach(function (event) {
            var ph = event['ph'];
            var name = event['name'];
            var microIterations = 1;
            var microIterationsMatch = lang_1.RegExpWrapper.firstMatch(_MICRO_ITERATIONS_REGEX, name);
            if (lang_1.isPresent(microIterationsMatch)) {
                name = microIterationsMatch[1];
                microIterations = lang_1.NumberWrapper.parseInt(microIterationsMatch[2], 10);
            }
            if (lang_1.StringWrapper.equals(ph, 'b') && lang_1.StringWrapper.equals(name, markName)) {
                markStartEvent = event;
            }
            else if (lang_1.StringWrapper.equals(ph, 'e') && lang_1.StringWrapper.equals(name, markName)) {
                markEndEvent = event;
            }
            if (lang_1.isPresent(markStartEvent) && lang_1.isBlank(markEndEvent) &&
                event['pid'] === markStartEvent['pid']) {
                if (lang_1.StringWrapper.equals(ph, 'b') && lang_1.StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
                    if (lang_1.isPresent(frameCaptureStartEvent)) {
                        throw new lang_1.BaseException('can capture frames only once per benchmark run');
                    }
                    if (!_this._captureFrames) {
                        throw new lang_1.BaseException('found start event for frame capture, but frame capture was not requested in benchpress');
                    }
                    frameCaptureStartEvent = event;
                }
                else if (lang_1.StringWrapper.equals(ph, 'e') &&
                    lang_1.StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
                    if (lang_1.isBlank(frameCaptureStartEvent)) {
                        throw new lang_1.BaseException('missing start event for frame capture');
                    }
                    frameCaptureEndEvent = event;
                }
                if (lang_1.StringWrapper.equals(ph, 'I') || lang_1.StringWrapper.equals(ph, 'i')) {
                    if (lang_1.isPresent(frameCaptureStartEvent) && lang_1.isBlank(frameCaptureEndEvent) &&
                        lang_1.StringWrapper.equals(name, 'frame')) {
                        frameTimestamps.push(event['ts']);
                        if (frameTimestamps.length >= 2) {
                            frameTimes.push(frameTimestamps[frameTimestamps.length - 1] -
                                frameTimestamps[frameTimestamps.length - 2]);
                        }
                    }
                }
                if (lang_1.StringWrapper.equals(ph, 'B') || lang_1.StringWrapper.equals(ph, 'b')) {
                    if (lang_1.isBlank(intervalStarts[name])) {
                        intervalStartCount[name] = 1;
                        intervalStarts[name] = event;
                    }
                    else {
                        intervalStartCount[name]++;
                    }
                }
                else if ((lang_1.StringWrapper.equals(ph, 'E') || lang_1.StringWrapper.equals(ph, 'e')) &&
                    lang_1.isPresent(intervalStarts[name])) {
                    intervalStartCount[name]--;
                    if (intervalStartCount[name] === 0) {
                        var startEvent = intervalStarts[name];
                        var duration = (event['ts'] - startEvent['ts']);
                        intervalStarts[name] = null;
                        if (lang_1.StringWrapper.equals(name, 'gc')) {
                            result['gcTime'] += duration;
                            var amount = (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
                            result['gcAmount'] += amount;
                            var majorGc = event['args']['majorGc'];
                            if (lang_1.isPresent(majorGc) && majorGc) {
                                result['majorGcTime'] += duration;
                            }
                            if (lang_1.isPresent(intervalStarts['script'])) {
                                gcTimeInScript += duration;
                            }
                        }
                        else if (lang_1.StringWrapper.equals(name, 'render')) {
                            result['renderTime'] += duration;
                            if (lang_1.isPresent(intervalStarts['script'])) {
                                renderTimeInScript += duration;
                            }
                        }
                        else if (lang_1.StringWrapper.equals(name, 'script')) {
                            result['scriptTime'] += duration;
                        }
                        else if (lang_1.isPresent(_this._microMetrics[name])) {
                            result[name] += duration / microIterations;
                        }
                    }
                }
            }
        });
        if (!lang_1.isPresent(markStartEvent) || !lang_1.isPresent(markEndEvent)) {
            // not all events have been received, no further processing for now
            return null;
        }
        if (lang_1.isPresent(markEndEvent) && lang_1.isPresent(frameCaptureStartEvent) &&
            lang_1.isBlank(frameCaptureEndEvent)) {
            throw new lang_1.BaseException('missing end event for frame capture');
        }
        if (this._captureFrames && lang_1.isBlank(frameCaptureStartEvent)) {
            throw new lang_1.BaseException('frame capture requested in benchpress, but no start event was found');
        }
        if (frameTimes.length > 0) {
            this._addFrameMetrics(result, frameTimes);
        }
        result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
        return result;
    };
    PerflogMetric.prototype._addFrameMetrics = function (result, frameTimes) {
        result['frameTime.mean'] =
            collection_1.ListWrapper.reduce(frameTimes, function (a, b) { return a + b; }, 0) / frameTimes.length;
        var firstFrame = frameTimes[0];
        result['frameTime.worst'] = collection_1.ListWrapper.reduce(frameTimes, function (a, b) { return a > b ? a : b; }, firstFrame);
        result['frameTime.best'] = collection_1.ListWrapper.reduce(frameTimes, function (a, b) { return a < b ? a : b; }, firstFrame);
        result['frameTime.smooth'] =
            collection_1.ListWrapper.filter(frameTimes, function (a) { return a < _FRAME_TIME_SMOOTH_THRESHOLD; }).length /
                frameTimes.length;
    };
    PerflogMetric.prototype._markName = function (index) { return "" + _MARK_NAME_PREFIX + index; };
    return PerflogMetric;
})(metric_1.Metric);
exports.PerflogMetric = PerflogMetric;
var _MICRO_ITERATIONS_REGEX = /(.+)\*(\d+)$/g;
var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new di_1.OpaqueToken('PerflogMetric.setTimeout');
var _MARK_NAME_FRAME_CAPUTRE = 'frameCapture';
// using 17ms as a somewhat looser threshold, instead of 16.6666ms
var _FRAME_TIME_SMOOTH_THRESHOLD = 17;
var _BINDINGS = [
    di_1.bind(PerflogMetric)
        .toFactory(function (driverExtension, setTimeout, microMetrics, forceGc, captureFrames) {
        return new PerflogMetric(driverExtension, setTimeout, microMetrics, forceGc, captureFrames);
    }, [
        web_driver_extension_1.WebDriverExtension,
        _SET_TIMEOUT,
        common_options_1.Options.MICRO_METRICS,
        common_options_1.Options.FORCE_GC,
        common_options_1.Options.CAPTURE_FRAMES
    ]),
    di_1.bind(_SET_TIMEOUT).toValue(function (fn, millis) { return async_1.TimerWrapper.setTimeout(fn, millis); })
];

},{"../common_options":4,"../metric":6,"../web_driver_extension":21,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],9:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
/**
 * A reporter reports measure values and the valid sample.
 */
var Reporter = (function () {
    function Reporter() {
    }
    Reporter.bindTo = function (delegateToken) {
        return [di_1.bind(Reporter).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    Reporter.prototype.reportMeasureValues = function (values) { throw new lang_1.BaseException('NYI'); };
    Reporter.prototype.reportSample = function (completeSample, validSample) {
        throw new lang_1.BaseException('NYI');
    };
    Reporter = __decorate([
        lang_1.ABSTRACT(), 
        __metadata('design:paramtypes', [])
    ], Reporter);
    return Reporter;
})();
exports.Reporter = Reporter;

},{"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],10:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var async_1 = require('angular2/src/core/facade/async');
var math_1 = require('angular2/src/core/facade/math');
var di_1 = require('angular2/src/core/di');
var statistic_1 = require('../statistic');
var reporter_1 = require('../reporter');
var sample_description_1 = require('../sample_description');
/**
 * A reporter for the console
 */
var ConsoleReporter = (function (_super) {
    __extends(ConsoleReporter, _super);
    function ConsoleReporter(_columnWidth, sampleDescription, _print) {
        _super.call(this);
        this._columnWidth = _columnWidth;
        this._print = _print;
        this._metricNames = ConsoleReporter._sortedProps(sampleDescription.metrics);
        this._printDescription(sampleDescription);
    }
    Object.defineProperty(ConsoleReporter, "PRINT", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PRINT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConsoleReporter, "COLUMN_WIDTH", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _COLUMN_WIDTH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConsoleReporter, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    ConsoleReporter._lpad = function (value, columnWidth, fill) {
        if (fill === void 0) { fill = ' '; }
        var result = '';
        for (var i = 0; i < columnWidth - value.length; i++) {
            result += fill;
        }
        return result + value;
    };
    ConsoleReporter._formatNum = function (n) { return lang_1.NumberWrapper.toFixed(n, 2); };
    ConsoleReporter._sortedProps = function (obj) {
        var props = [];
        collection_1.StringMapWrapper.forEach(obj, function (value, prop) { return props.push(prop); });
        props.sort();
        return props;
    };
    ConsoleReporter.prototype._printDescription = function (sampleDescription) {
        var _this = this;
        this._print("BENCHMARK " + sampleDescription.id);
        this._print('Description:');
        var props = ConsoleReporter._sortedProps(sampleDescription.description);
        props.forEach(function (prop) { _this._print("- " + prop + ": " + sampleDescription.description[prop]); });
        this._print('Metrics:');
        this._metricNames.forEach(function (metricName) {
            _this._print("- " + metricName + ": " + sampleDescription.metrics[metricName]);
        });
        this._print('');
        this._printStringRow(this._metricNames);
        this._printStringRow(this._metricNames.map(function (_) { return ''; }), '-');
    };
    ConsoleReporter.prototype.reportMeasureValues = function (measureValues) {
        var formattedValues = collection_1.ListWrapper.map(this._metricNames, function (metricName) {
            var value = measureValues.values[metricName];
            return ConsoleReporter._formatNum(value);
        });
        this._printStringRow(formattedValues);
        return async_1.PromiseWrapper.resolve(null);
    };
    ConsoleReporter.prototype.reportSample = function (completeSample, validSample) {
        this._printStringRow(this._metricNames.map(function (_) { return ''; }), '=');
        this._printStringRow(collection_1.ListWrapper.map(this._metricNames, function (metricName) {
            var sample = collection_1.ListWrapper.map(validSample, function (measureValues) { return measureValues.values[metricName]; });
            var mean = statistic_1.Statistic.calculateMean(sample);
            var cv = statistic_1.Statistic.calculateCoefficientOfVariation(sample, mean);
            var formattedMean = ConsoleReporter._formatNum(mean);
            // Note: Don't use the unicode character for +- as it might cause
            // hickups for consoles...
            return lang_1.NumberWrapper.isNaN(cv) ?
                formattedMean :
                formattedMean + "+-" + math_1.Math.floor(cv) + "%";
        }));
        return async_1.PromiseWrapper.resolve(null);
    };
    ConsoleReporter.prototype._printStringRow = function (parts, fill) {
        var _this = this;
        if (fill === void 0) { fill = ' '; }
        this._print(collection_1.ListWrapper.map(parts, function (part) {
            var w = _this._columnWidth;
            return ConsoleReporter._lpad(part, w, fill);
        }).join(' | '));
    };
    return ConsoleReporter;
})(reporter_1.Reporter);
exports.ConsoleReporter = ConsoleReporter;
var _PRINT = new di_1.OpaqueToken('ConsoleReporter.print');
var _COLUMN_WIDTH = new di_1.OpaqueToken('ConsoleReporter.columnWidth');
var _BINDINGS = [
    di_1.bind(ConsoleReporter)
        .toFactory(function (columnWidth, sampleDescription, print) {
        return new ConsoleReporter(columnWidth, sampleDescription, print);
    }, [_COLUMN_WIDTH, sample_description_1.SampleDescription, _PRINT]),
    di_1.bind(_COLUMN_WIDTH).toValue(18),
    di_1.bind(_PRINT).toValue(lang_1.print)
];

},{"../reporter":9,"../sample_description":14,"../statistic":16,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38,"angular2/src/core/facade/math":39}],11:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var lang_1 = require('angular2/src/core/facade/lang');
var async_1 = require('angular2/src/core/facade/async');
var di_1 = require('angular2/src/core/di');
var reporter_1 = require('../reporter');
var sample_description_1 = require('../sample_description');
var common_options_1 = require('../common_options');
/**
 * A reporter that writes results into a json file.
 */
var JsonFileReporter = (function (_super) {
    __extends(JsonFileReporter, _super);
    function JsonFileReporter(sampleDescription, path, writeFile, now) {
        _super.call(this);
        this._description = sampleDescription;
        this._path = path;
        this._writeFile = writeFile;
        this._now = now;
    }
    Object.defineProperty(JsonFileReporter, "PATH", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PATH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JsonFileReporter, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    JsonFileReporter.prototype.reportMeasureValues = function (measureValues) {
        return async_1.PromiseWrapper.resolve(null);
    };
    JsonFileReporter.prototype.reportSample = function (completeSample, validSample) {
        var content = lang_1.Json.stringify({
            'description': this._description,
            'completeSample': completeSample,
            'validSample': validSample
        });
        var filePath = this._path + "/" + this._description.id + "_" + lang_1.DateWrapper.toMillis(this._now()) + ".json";
        return this._writeFile(filePath, content);
    };
    return JsonFileReporter;
})(reporter_1.Reporter);
exports.JsonFileReporter = JsonFileReporter;
var _PATH = new di_1.OpaqueToken('JsonFileReporter.path');
var _BINDINGS = [
    di_1.bind(JsonFileReporter)
        .toFactory(function (sampleDescription, path, writeFile, now) {
        return new JsonFileReporter(sampleDescription, path, writeFile, now);
    }, [sample_description_1.SampleDescription, _PATH, common_options_1.Options.WRITE_FILE, common_options_1.Options.NOW]),
    di_1.bind(_PATH).toValue('.')
];

},{"../common_options":4,"../reporter":9,"../sample_description":14,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/lang":38}],12:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/core/facade/collection');
var async_1 = require('angular2/src/core/facade/async');
var reporter_1 = require('../reporter');
var MultiReporter = (function (_super) {
    __extends(MultiReporter, _super);
    function MultiReporter(reporters) {
        _super.call(this);
        this._reporters = reporters;
    }
    MultiReporter.createBindings = function (childTokens) {
        return [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return collection_1.ListWrapper.map(childTokens, function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(MultiReporter).toFactory(function (children) { return new MultiReporter(children); }, [_CHILDREN])
        ];
    };
    MultiReporter.prototype.reportMeasureValues = function (values) {
        return async_1.PromiseWrapper.all(collection_1.ListWrapper.map(this._reporters, function (reporter) { return reporter.reportMeasureValues(values); }));
    };
    MultiReporter.prototype.reportSample = function (completeSample, validSample) {
        return async_1.PromiseWrapper.all(collection_1.ListWrapper.map(this._reporters, function (reporter) { return reporter.reportSample(completeSample, validSample); }));
    };
    return MultiReporter;
})(reporter_1.Reporter);
exports.MultiReporter = MultiReporter;
var _CHILDREN = new di_1.OpaqueToken('MultiReporter.children');

},{"../reporter":9,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/collection":37}],13:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
var async_1 = require('angular2/src/core/facade/async');
var sampler_1 = require('./sampler');
var console_reporter_1 = require('./reporter/console_reporter');
var multi_reporter_1 = require('./reporter/multi_reporter');
var regression_slope_validator_1 = require('./validator/regression_slope_validator');
var size_validator_1 = require('./validator/size_validator');
var validator_1 = require('./validator');
var perflog_metric_1 = require('./metric/perflog_metric');
var multi_metric_1 = require('./metric/multi_metric');
var chrome_driver_extension_1 = require('./webdriver/chrome_driver_extension');
var firefox_driver_extension_1 = require('./webdriver/firefox_driver_extension');
var ios_driver_extension_1 = require('./webdriver/ios_driver_extension');
var web_driver_extension_1 = require('./web_driver_extension');
var sample_description_1 = require('./sample_description');
var web_driver_adapter_1 = require('./web_driver_adapter');
var reporter_1 = require('./reporter');
var metric_1 = require('./metric');
var common_options_1 = require('./common_options');
/**
 * The Runner is the main entry point for executing a sample run.
 * It provides defaults, creates the injector and calls the sampler.
 */
var Runner = (function () {
    function Runner(defaultBindings) {
        if (defaultBindings === void 0) { defaultBindings = null; }
        if (lang_1.isBlank(defaultBindings)) {
            defaultBindings = [];
        }
        this._defaultBindings = defaultBindings;
    }
    Runner.prototype.sample = function (_a) {
        var id = _a.id, execute = _a.execute, prepare = _a.prepare, microMetrics = _a.microMetrics, bindings = _a.bindings;
        var sampleBindings = [
            _DEFAULT_BINDINGS,
            this._defaultBindings,
            di_1.bind(common_options_1.Options.SAMPLE_ID).toValue(id),
            di_1.bind(common_options_1.Options.EXECUTE).toValue(execute)
        ];
        if (lang_1.isPresent(prepare)) {
            sampleBindings.push(di_1.bind(common_options_1.Options.PREPARE).toValue(prepare));
        }
        if (lang_1.isPresent(microMetrics)) {
            sampleBindings.push(di_1.bind(common_options_1.Options.MICRO_METRICS).toValue(microMetrics));
        }
        if (lang_1.isPresent(bindings)) {
            sampleBindings.push(bindings);
        }
        var inj = di_1.Injector.resolveAndCreate(sampleBindings);
        var adapter = inj.get(web_driver_adapter_1.WebDriverAdapter);
        return async_1.PromiseWrapper
            .all([adapter.capabilities(), adapter.executeScript('return window.navigator.userAgent;')])
            .then(function (args) {
            var capabilities = args[0];
            var userAgent = args[1];
            // This might still create instances twice. We are creating a new injector with all the
            // bindings.
            // Only WebDriverAdapter is reused.
            // TODO vsavkin consider changing it when toAsyncFactory is added back or when child
            // injectors are handled better.
            var injector = di_1.Injector.resolveAndCreate([
                sampleBindings,
                di_1.bind(common_options_1.Options.CAPABILITIES).toValue(capabilities),
                di_1.bind(common_options_1.Options.USER_AGENT).toValue(userAgent),
                di_1.bind(web_driver_adapter_1.WebDriverAdapter).toValue(adapter)
            ]);
            var sampler = injector.get(sampler_1.Sampler);
            return sampler.sample();
        });
    };
    return Runner;
})();
exports.Runner = Runner;
var _DEFAULT_BINDINGS = [
    common_options_1.Options.DEFAULT_BINDINGS,
    sampler_1.Sampler.BINDINGS,
    console_reporter_1.ConsoleReporter.BINDINGS,
    regression_slope_validator_1.RegressionSlopeValidator.BINDINGS,
    size_validator_1.SizeValidator.BINDINGS,
    chrome_driver_extension_1.ChromeDriverExtension.BINDINGS,
    firefox_driver_extension_1.FirefoxDriverExtension.BINDINGS,
    ios_driver_extension_1.IOsDriverExtension.BINDINGS,
    perflog_metric_1.PerflogMetric.BINDINGS,
    sample_description_1.SampleDescription.BINDINGS,
    multi_reporter_1.MultiReporter.createBindings([console_reporter_1.ConsoleReporter]),
    multi_metric_1.MultiMetric.createBindings([perflog_metric_1.PerflogMetric]),
    reporter_1.Reporter.bindTo(multi_reporter_1.MultiReporter),
    validator_1.Validator.bindTo(regression_slope_validator_1.RegressionSlopeValidator),
    web_driver_extension_1.WebDriverExtension.bindTo([chrome_driver_extension_1.ChromeDriverExtension, firefox_driver_extension_1.FirefoxDriverExtension, ios_driver_extension_1.IOsDriverExtension]),
    metric_1.Metric.bindTo(multi_metric_1.MultiMetric),
];

},{"./common_options":4,"./metric":6,"./metric/multi_metric":7,"./metric/perflog_metric":8,"./reporter":9,"./reporter/console_reporter":10,"./reporter/multi_reporter":12,"./sample_description":14,"./sampler":15,"./validator":17,"./validator/regression_slope_validator":18,"./validator/size_validator":19,"./web_driver_adapter":20,"./web_driver_extension":21,"./webdriver/chrome_driver_extension":22,"./webdriver/firefox_driver_extension":23,"./webdriver/ios_driver_extension":24,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/lang":38}],14:[function(require,module,exports){
'use strict';var collection_1 = require('angular2/src/core/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('./validator');
var metric_1 = require('./metric');
var common_options_1 = require('./common_options');
/**
 * SampleDescription merges all available descriptions about a sample
 */
var SampleDescription = (function () {
    function SampleDescription(id, descriptions, metrics) {
        var _this = this;
        this.id = id;
        this.metrics = metrics;
        this.description = {};
        collection_1.ListWrapper.forEach(descriptions, function (description) {
            collection_1.StringMapWrapper.forEach(description, function (value, prop) { return _this.description[prop] = value; });
        });
    }
    Object.defineProperty(SampleDescription, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    SampleDescription.prototype.toJson = function () { return { 'id': this.id, 'description': this.description, 'metrics': this.metrics }; };
    return SampleDescription;
})();
exports.SampleDescription = SampleDescription;
var _BINDINGS = [
    di_1.bind(SampleDescription)
        .toFactory(function (metric, id, forceGc, userAgent, validator, defaultDesc, userDesc) {
        return new SampleDescription(id, [
            { 'forceGc': forceGc, 'userAgent': userAgent },
            validator.describe(),
            defaultDesc,
            userDesc
        ], metric.describe());
    }, [
        metric_1.Metric,
        common_options_1.Options.SAMPLE_ID,
        common_options_1.Options.FORCE_GC,
        common_options_1.Options.USER_AGENT,
        validator_1.Validator,
        common_options_1.Options.DEFAULT_DESCRIPTION,
        common_options_1.Options.SAMPLE_DESCRIPTION
    ])
];

},{"./common_options":4,"./metric":6,"./validator":17,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37}],15:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
var async_1 = require('angular2/src/core/facade/async');
var di_1 = require('angular2/src/core/di');
var metric_1 = require('./metric');
var validator_1 = require('./validator');
var reporter_1 = require('./reporter');
var web_driver_adapter_1 = require('./web_driver_adapter');
var common_options_1 = require('./common_options');
var measure_values_1 = require('./measure_values');
/**
 * The Sampler owns the sample loop:
 * 1. calls the prepare/execute callbacks,
 * 2. gets data from the metric
 * 3. asks the validator for a valid sample
 * 4. reports the new data to the reporter
 * 5. loop until there is a valid sample
 */
var Sampler = (function () {
    function Sampler(_a) {
        var _b = _a === void 0 ? {} : _a, driver = _b.driver, metric = _b.metric, reporter = _b.reporter, validator = _b.validator, prepare = _b.prepare, execute = _b.execute, now = _b.now;
        this._driver = driver;
        this._metric = metric;
        this._reporter = reporter;
        this._validator = validator;
        this._prepare = prepare;
        this._execute = execute;
        this._now = now;
    }
    Object.defineProperty(Sampler, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    Sampler.prototype.sample = function () {
        var _this = this;
        var loop;
        loop = function (lastState) {
            return _this._iterate(lastState).then(function (newState) {
                if (lang_1.isPresent(newState.validSample)) {
                    return newState;
                }
                else {
                    return loop(newState);
                }
            });
        };
        return loop(new SampleState([], null));
    };
    Sampler.prototype._iterate = function (lastState) {
        var _this = this;
        var resultPromise;
        if (lang_1.isPresent(this._prepare)) {
            resultPromise = this._driver.waitFor(this._prepare);
        }
        else {
            resultPromise = async_1.PromiseWrapper.resolve(null);
        }
        if (lang_1.isPresent(this._prepare) || lastState.completeSample.length === 0) {
            resultPromise = resultPromise.then(function (_) { return _this._metric.beginMeasure(); });
        }
        return resultPromise.then(function (_) { return _this._driver.waitFor(_this._execute); })
            .then(function (_) { return _this._metric.endMeasure(lang_1.isBlank(_this._prepare)); })
            .then(function (measureValues) { return _this._report(lastState, measureValues); });
    };
    Sampler.prototype._report = function (state, metricValues) {
        var _this = this;
        var measureValues = new measure_values_1.MeasureValues(state.completeSample.length, this._now(), metricValues);
        var completeSample = state.completeSample.concat([measureValues]);
        var validSample = this._validator.validate(completeSample);
        var resultPromise = this._reporter.reportMeasureValues(measureValues);
        if (lang_1.isPresent(validSample)) {
            resultPromise =
                resultPromise.then(function (_) { return _this._reporter.reportSample(completeSample, validSample); });
        }
        return resultPromise.then(function (_) { return new SampleState(completeSample, validSample); });
    };
    return Sampler;
})();
exports.Sampler = Sampler;
var SampleState = (function () {
    function SampleState(completeSample, validSample) {
        this.completeSample = completeSample;
        this.validSample = validSample;
    }
    return SampleState;
})();
exports.SampleState = SampleState;
var _BINDINGS = [
    di_1.bind(Sampler)
        .toFactory(function (driver, metric, reporter, validator, prepare, execute, now) { return new Sampler({
        driver: driver,
        reporter: reporter,
        validator: validator,
        metric: metric,
        // TODO(tbosch): DI right now does not support null/undefined objects
        // Mostly because the cache would have to be initialized with a
        // special null object, which is expensive.
        prepare: prepare !== false ? prepare : null,
        execute: execute,
        now: now
    }); }, [
        web_driver_adapter_1.WebDriverAdapter,
        metric_1.Metric,
        reporter_1.Reporter,
        validator_1.Validator,
        common_options_1.Options.PREPARE,
        common_options_1.Options.EXECUTE,
        common_options_1.Options.NOW
    ])
];

},{"./common_options":4,"./measure_values":5,"./metric":6,"./reporter":9,"./validator":17,"./web_driver_adapter":20,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"angular2/src/core/facade/lang":38}],16:[function(require,module,exports){
'use strict';var math_1 = require('angular2/src/core/facade/math');
var collection_1 = require('angular2/src/core/facade/collection');
var Statistic = (function () {
    function Statistic() {
    }
    Statistic.calculateCoefficientOfVariation = function (sample, mean) {
        return Statistic.calculateStandardDeviation(sample, mean) / mean * 100;
    };
    Statistic.calculateMean = function (sample) {
        var total = 0;
        collection_1.ListWrapper.forEach(sample, function (x) { total += x; });
        return total / sample.length;
    };
    Statistic.calculateStandardDeviation = function (sample, mean) {
        var deviation = 0;
        collection_1.ListWrapper.forEach(sample, function (x) { deviation += math_1.Math.pow(x - mean, 2); });
        deviation = deviation / (sample.length);
        deviation = math_1.Math.sqrt(deviation);
        return deviation;
    };
    Statistic.calculateRegressionSlope = function (xValues, xMean, yValues, yMean) {
        // See http://en.wikipedia.org/wiki/Simple_linear_regression
        var dividendSum = 0;
        var divisorSum = 0;
        for (var i = 0; i < xValues.length; i++) {
            dividendSum += (xValues[i] - xMean) * (yValues[i] - yMean);
            divisorSum += math_1.Math.pow(xValues[i] - xMean, 2);
        }
        return dividendSum / divisorSum;
    };
    return Statistic;
})();
exports.Statistic = Statistic;

},{"angular2/src/core/facade/collection":37,"angular2/src/core/facade/math":39}],17:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
/**
 * A Validator calculates a valid sample out of the complete sample.
 * A valid sample is a sample that represents the population that should be observed
 * in the correct way.
 */
var Validator = (function () {
    function Validator() {
    }
    Validator.bindTo = function (delegateToken) {
        return [di_1.bind(Validator).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    /**
     * Calculates a valid sample out of the complete sample
     */
    Validator.prototype.validate = function (completeSample) { throw new lang_1.BaseException('NYI'); };
    /**
     * Returns a Map that describes the properties of the validator
     * (e.g. sample size, ...)
     */
    Validator.prototype.describe = function () { throw new lang_1.BaseException('NYI'); };
    Validator = __decorate([
        lang_1.ABSTRACT(), 
        __metadata('design:paramtypes', [])
    ], Validator);
    return Validator;
})();
exports.Validator = Validator;

},{"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],18:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var collection_1 = require('angular2/src/core/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('../validator');
var statistic_1 = require('../statistic');
/**
 * A validator that checks the regression slope of a specific metric.
 * Waits for the regression slope to be >=0.
 */
var RegressionSlopeValidator = (function (_super) {
    __extends(RegressionSlopeValidator, _super);
    function RegressionSlopeValidator(sampleSize, metric) {
        _super.call(this);
        this._sampleSize = sampleSize;
        this._metric = metric;
    }
    Object.defineProperty(RegressionSlopeValidator, "SAMPLE_SIZE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SAMPLE_SIZE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegressionSlopeValidator, "METRIC", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _METRIC; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegressionSlopeValidator, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    RegressionSlopeValidator.prototype.describe = function () {
        return { 'sampleSize': this._sampleSize, 'regressionSlopeMetric': this._metric };
    };
    RegressionSlopeValidator.prototype.validate = function (completeSample) {
        if (completeSample.length >= this._sampleSize) {
            var latestSample = collection_1.ListWrapper.slice(completeSample, completeSample.length - this._sampleSize, completeSample.length);
            var xValues = [];
            var yValues = [];
            for (var i = 0; i < latestSample.length; i++) {
                // For now, we only use the array index as x value.
                // TODO(tbosch): think about whether we should use time here instead
                xValues.push(i);
                yValues.push(latestSample[i].values[this._metric]);
            }
            var regressionSlope = statistic_1.Statistic.calculateRegressionSlope(xValues, statistic_1.Statistic.calculateMean(xValues), yValues, statistic_1.Statistic.calculateMean(yValues));
            return regressionSlope >= 0 ? latestSample : null;
        }
        else {
            return null;
        }
    };
    return RegressionSlopeValidator;
})(validator_1.Validator);
exports.RegressionSlopeValidator = RegressionSlopeValidator;
var _SAMPLE_SIZE = new di_1.OpaqueToken('RegressionSlopeValidator.sampleSize');
var _METRIC = new di_1.OpaqueToken('RegressionSlopeValidator.metric');
var _BINDINGS = [
    di_1.bind(RegressionSlopeValidator)
        .toFactory(function (sampleSize, metric) { return new RegressionSlopeValidator(sampleSize, metric); }, [_SAMPLE_SIZE, _METRIC]),
    di_1.bind(_SAMPLE_SIZE).toValue(10),
    di_1.bind(_METRIC).toValue('scriptTime')
];

},{"../statistic":16,"../validator":17,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37}],19:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var collection_1 = require('angular2/src/core/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('../validator');
/**
 * A validator that waits for the sample to have a certain size.
 */
var SizeValidator = (function (_super) {
    __extends(SizeValidator, _super);
    function SizeValidator(size) {
        _super.call(this);
        this._sampleSize = size;
    }
    Object.defineProperty(SizeValidator, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SizeValidator, "SAMPLE_SIZE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SAMPLE_SIZE; },
        enumerable: true,
        configurable: true
    });
    SizeValidator.prototype.describe = function () { return { 'sampleSize': this._sampleSize }; };
    SizeValidator.prototype.validate = function (completeSample) {
        if (completeSample.length >= this._sampleSize) {
            return collection_1.ListWrapper.slice(completeSample, completeSample.length - this._sampleSize, completeSample.length);
        }
        else {
            return null;
        }
    };
    return SizeValidator;
})(validator_1.Validator);
exports.SizeValidator = SizeValidator;
var _SAMPLE_SIZE = new di_1.OpaqueToken('SizeValidator.sampleSize');
var _BINDINGS = [
    di_1.bind(SizeValidator)
        .toFactory(function (size) { return new SizeValidator(size); }, [_SAMPLE_SIZE]),
    di_1.bind(_SAMPLE_SIZE).toValue(10)
];

},{"../validator":17,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37}],20:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
/**
 * A WebDriverAdapter bridges API differences between different WebDriver clients,
 * e.g. JS vs Dart Async vs Dart Sync webdriver.
 * Needs one implementation for every supported WebDriver client.
 */
var WebDriverAdapter = (function () {
    function WebDriverAdapter() {
    }
    WebDriverAdapter.bindTo = function (delegateToken) {
        return [di_1.bind(WebDriverAdapter).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    WebDriverAdapter.prototype.waitFor = function (callback) { throw new lang_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.executeScript = function (script) { throw new lang_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.executeAsyncScript = function (script) { throw new lang_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.capabilities = function () { throw new lang_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.logs = function (type) { throw new lang_1.BaseException('NYI'); };
    WebDriverAdapter = __decorate([
        lang_1.ABSTRACT(), 
        __metadata('design:paramtypes', [])
    ], WebDriverAdapter);
    return WebDriverAdapter;
})();
exports.WebDriverAdapter = WebDriverAdapter;

},{"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],21:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var common_options_1 = require('./common_options');
/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
var WebDriverExtension = (function () {
    function WebDriverExtension() {
    }
    WebDriverExtension.bindTo = function (childTokens) {
        var res = [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return collection_1.ListWrapper.map(childTokens, function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(WebDriverExtension)
                .toFactory(function (children, capabilities) {
                var delegate;
                collection_1.ListWrapper.forEach(children, function (extension) {
                    if (extension.supports(capabilities)) {
                        delegate = extension;
                    }
                });
                if (lang_1.isBlank(delegate)) {
                    throw new lang_1.BaseException('Could not find a delegate for given capabilities!');
                }
                return delegate;
            }, [_CHILDREN, common_options_1.Options.CAPABILITIES])
        ];
        return res;
    };
    WebDriverExtension.prototype.gc = function () { throw new lang_1.BaseException('NYI'); };
    WebDriverExtension.prototype.timeBegin = function (name) { throw new lang_1.BaseException('NYI'); };
    WebDriverExtension.prototype.timeEnd = function (name, restartName) { throw new lang_1.BaseException('NYI'); };
    /**
     * Format:
     * - cat: category of the event
     * - name: event name: 'script', 'gc', 'render', ...
     * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end), 'X' (Complete
     *event)
     * - ts: timestamp in ms, e.g. 12345
     * - pid: process id
     * - args: arguments, e.g. {heapSize: 1234}
     *
     * Based on [Chrome Trace Event
     *Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
     **/
    WebDriverExtension.prototype.readPerfLog = function () { throw new lang_1.BaseException('NYI'); };
    WebDriverExtension.prototype.perfLogFeatures = function () { throw new lang_1.BaseException('NYI'); };
    WebDriverExtension.prototype.supports = function (capabilities) { return true; };
    WebDriverExtension = __decorate([
        lang_1.ABSTRACT(), 
        __metadata('design:paramtypes', [])
    ], WebDriverExtension);
    return WebDriverExtension;
})();
exports.WebDriverExtension = WebDriverExtension;
var PerfLogFeatures = (function () {
    function PerfLogFeatures(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.render, render = _c === void 0 ? false : _c, _d = _b.gc, gc = _d === void 0 ? false : _d, _e = _b.frameCapture, frameCapture = _e === void 0 ? false : _e;
        this.render = render;
        this.gc = gc;
        this.frameCapture = frameCapture;
    }
    return PerfLogFeatures;
})();
exports.PerfLogFeatures = PerfLogFeatures;
var _CHILDREN = new di_1.OpaqueToken('WebDriverExtension.children');

},{"./common_options":4,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],22:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/core/facade/collection');
var lang_1 = require('angular2/src/core/facade/lang');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var common_options_1 = require('../common_options');
/**
 * Set the following 'traceCategories' to collect metrics in Chrome:
 * 'v8,blink.console,disabled-by-default-devtools.timeline,devtools.timeline'
 *
 * In order to collect the frame rate related metrics, add 'benchmark'
 * to the list above.
 */
var ChromeDriverExtension = (function (_super) {
    __extends(ChromeDriverExtension, _super);
    function ChromeDriverExtension(_driver, userAgent) {
        _super.call(this);
        this._driver = _driver;
        this._majorChromeVersion = this._parseChromeVersion(userAgent);
    }
    Object.defineProperty(ChromeDriverExtension, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    ChromeDriverExtension.prototype._parseChromeVersion = function (userAgent) {
        if (lang_1.isBlank(userAgent)) {
            return -1;
        }
        var v = lang_1.StringWrapper.split(userAgent, /Chrom(e|ium)\//g)[2];
        if (lang_1.isBlank(v)) {
            return -1;
        }
        v = lang_1.StringWrapper.split(v, /\./g)[0];
        if (lang_1.isBlank(v)) {
            return -1;
        }
        return lang_1.NumberWrapper.parseInt(v, 10);
    };
    ChromeDriverExtension.prototype.gc = function () { return this._driver.executeScript('window.gc()'); };
    ChromeDriverExtension.prototype.timeBegin = function (name) {
        return this._driver.executeScript("console.time('" + name + "');");
    };
    ChromeDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = "console.timeEnd('" + name + "');";
        if (lang_1.isPresent(restartName)) {
            script += "console.time('" + restartName + "');";
        }
        return this._driver.executeScript(script);
    };
    // See [Chrome Trace Event
    // Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
    ChromeDriverExtension.prototype.readPerfLog = function () {
        var _this = this;
        // TODO(tbosch): Chromedriver bug https://code.google.com/p/chromedriver/issues/detail?id=1098
        // Need to execute at least one command so that the browser logs can be read out!
        return this._driver.executeScript('1+1')
            .then(function (_) { return _this._driver.logs('performance'); })
            .then(function (entries) {
            var events = [];
            collection_1.ListWrapper.forEach(entries, function (entry) {
                var message = lang_1.Json.parse(entry['message'])['message'];
                if (lang_1.StringWrapper.equals(message['method'], 'Tracing.dataCollected')) {
                    events.push(message['params']);
                }
                if (lang_1.StringWrapper.equals(message['method'], 'Tracing.bufferUsage')) {
                    throw new lang_1.BaseException('The DevTools trace buffer filled during the test!');
                }
            });
            return _this._convertPerfRecordsToEvents(events);
        });
    };
    ChromeDriverExtension.prototype._convertPerfRecordsToEvents = function (chromeEvents, normalizedEvents) {
        var _this = this;
        if (normalizedEvents === void 0) { normalizedEvents = null; }
        if (lang_1.isBlank(normalizedEvents)) {
            normalizedEvents = [];
        }
        var majorGCPids = {};
        chromeEvents.forEach(function (event) {
            var categories = _this._parseCategories(event['cat']);
            var name = event['name'];
            if (_this._isEvent(categories, name, ['blink.console'])) {
                normalizedEvents.push(normalizeEvent(event, { 'name': name }));
            }
            else if (_this._isEvent(categories, name, ['benchmark'], 'BenchmarkInstrumentation::ImplThreadRenderingStats')) {
                // TODO(goderbauer): Instead of BenchmarkInstrumentation::ImplThreadRenderingStats the
                // following events should be used (if available) for more accurate measurments:
                //   1st choice: vsync_before - ground truth on Android
                //   2nd choice: BenchmarkInstrumentation::DisplayRenderingStats - available on systems with
                //               new surfaces framework (not broadly enabled yet)
                //   3rd choice: BenchmarkInstrumentation::ImplThreadRenderingStats - fallback event that is
                //               allways available if something is rendered
                var frameCount = event['args']['data']['frame_count'];
                if (frameCount > 1) {
                    throw new lang_1.BaseException('multi-frame render stats not supported');
                }
                if (frameCount == 1) {
                    normalizedEvents.push(normalizeEvent(event, { 'name': 'frame' }));
                }
            }
            else if (_this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Rasterize') ||
                _this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'CompositeLayers')) {
                normalizedEvents.push(normalizeEvent(event, { 'name': 'render' }));
            }
            else if (_this._majorChromeVersion < 45) {
                var normalizedEvent = _this._processAsPreChrome45Event(event, categories, majorGCPids);
                if (normalizedEvent != null)
                    normalizedEvents.push(normalizedEvent);
            }
            else {
                var normalizedEvent = _this._processAsPostChrome44Event(event, categories);
                if (normalizedEvent != null)
                    normalizedEvents.push(normalizedEvent);
            }
        });
        return normalizedEvents;
    };
    ChromeDriverExtension.prototype._processAsPreChrome45Event = function (event, categories, majorGCPids) {
        var name = event['name'];
        var args = event['args'];
        var pid = event['pid'];
        var ph = event['ph'];
        if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'FunctionCall') &&
            (lang_1.isBlank(args) || lang_1.isBlank(args['data']) ||
                !lang_1.StringWrapper.equals(args['data']['scriptName'], 'InjectedScript'))) {
            return normalizeEvent(event, { 'name': 'script' });
        }
        else if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'RecalculateStyles') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Layout') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'UpdateLayerTree') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Paint')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        else if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'GCEvent')) {
            var normArgs = {
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            if (lang_1.StringWrapper.equals(ph, 'E')) {
                normArgs['majorGc'] = lang_1.isPresent(majorGCPids[pid]) && majorGCPids[pid];
            }
            majorGCPids[pid] = false;
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['v8'], 'majorGC') &&
            lang_1.StringWrapper.equals(ph, 'B')) {
            majorGCPids[pid] = true;
        }
        return null; // nothing useful in this event
    };
    ChromeDriverExtension.prototype._processAsPostChrome44Event = function (event, categories) {
        var name = event['name'];
        var args = event['args'];
        if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'MajorGC')) {
            var normArgs = {
                'majorGc': true,
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'MinorGC')) {
            var normArgs = {
                'majorGc': false,
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'FunctionCall') &&
            (lang_1.isBlank(args) || lang_1.isBlank(args['data']) ||
                !lang_1.StringWrapper.equals(args['data']['scriptName'], 'InjectedScript'))) {
            return normalizeEvent(event, { 'name': 'script' });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'blink'], 'UpdateLayoutTree')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline'], 'UpdateLayerTree') ||
            this._isEvent(categories, name, ['devtools.timeline'], 'Layout') ||
            this._isEvent(categories, name, ['devtools.timeline'], 'Paint')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        return null; // nothing useful in this event
    };
    ChromeDriverExtension.prototype._parseCategories = function (categories) {
        return lang_1.StringWrapper.split(categories, /,/g);
    };
    ChromeDriverExtension.prototype._isEvent = function (eventCategories, eventName, expectedCategories, expectedName) {
        if (expectedName === void 0) { expectedName = null; }
        var hasCategories = collection_1.ListWrapper.reduce(expectedCategories, function (value, cat) {
            return value && collection_1.ListWrapper.contains(eventCategories, cat);
        }, true);
        return lang_1.isBlank(expectedName) ? hasCategories :
            hasCategories && lang_1.StringWrapper.equals(eventName, expectedName);
    };
    ChromeDriverExtension.prototype.perfLogFeatures = function () {
        return new web_driver_extension_1.PerfLogFeatures({ render: true, gc: true, frameCapture: true });
    };
    ChromeDriverExtension.prototype.supports = function (capabilities) {
        return this._majorChromeVersion != -1 &&
            lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'chrome');
    };
    return ChromeDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.ChromeDriverExtension = ChromeDriverExtension;
function normalizeEvent(chromeEvent, data) {
    var ph = chromeEvent['ph'];
    if (lang_1.StringWrapper.equals(ph, 'S')) {
        ph = 'b';
    }
    else if (lang_1.StringWrapper.equals(ph, 'F')) {
        ph = 'e';
    }
    var result = { 'pid': chromeEvent['pid'], 'ph': ph, 'cat': 'timeline', 'ts': chromeEvent['ts'] / 1000 };
    if (chromeEvent['ph'] === 'X') {
        var dur = chromeEvent['dur'];
        if (lang_1.isBlank(dur)) {
            dur = chromeEvent['tdur'];
        }
        result['dur'] = lang_1.isBlank(dur) ? 0.0 : dur / 1000;
    }
    collection_1.StringMapWrapper.forEach(data, function (value, prop) { result[prop] = value; });
    return result;
}
var _BINDINGS = [
    di_1.bind(ChromeDriverExtension)
        .toFactory(function (driver, userAgent) { return new ChromeDriverExtension(driver, userAgent); }, [web_driver_adapter_1.WebDriverAdapter, common_options_1.Options.USER_AGENT])
];

},{"../common_options":4,"../web_driver_adapter":20,"../web_driver_extension":21,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],23:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/core/facade/lang');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var FirefoxDriverExtension = (function (_super) {
    __extends(FirefoxDriverExtension, _super);
    function FirefoxDriverExtension(_driver) {
        _super.call(this);
        this._driver = _driver;
        this._profilerStarted = false;
    }
    Object.defineProperty(FirefoxDriverExtension, "BINDINGS", {
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    FirefoxDriverExtension.prototype.gc = function () { return this._driver.executeScript('window.forceGC()'); };
    FirefoxDriverExtension.prototype.timeBegin = function (name) {
        if (!this._profilerStarted) {
            this._profilerStarted = true;
            this._driver.executeScript('window.startProfiler();');
        }
        return this._driver.executeScript('window.markStart("' + name + '");');
    };
    FirefoxDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = 'window.markEnd("' + name + '");';
        if (lang_1.isPresent(restartName)) {
            script += 'window.markStart("' + restartName + '");';
        }
        return this._driver.executeScript(script);
    };
    FirefoxDriverExtension.prototype.readPerfLog = function () {
        return this._driver.executeAsyncScript('var cb = arguments[0]; window.getProfile(cb);');
    };
    FirefoxDriverExtension.prototype.perfLogFeatures = function () { return new web_driver_extension_1.PerfLogFeatures({ render: true, gc: true }); };
    FirefoxDriverExtension.prototype.supports = function (capabilities) {
        return lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'firefox');
    };
    return FirefoxDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.FirefoxDriverExtension = FirefoxDriverExtension;
var _BINDINGS = [
    di_1.bind(FirefoxDriverExtension)
        .toFactory(function (driver) { return new FirefoxDriverExtension(driver); }, [web_driver_adapter_1.WebDriverAdapter])
];

},{"../web_driver_adapter":20,"../web_driver_extension":21,"angular2/src/core/di":26,"angular2/src/core/facade/lang":38}],24:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/core/facade/collection');
var lang_1 = require('angular2/src/core/facade/lang');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var IOsDriverExtension = (function (_super) {
    __extends(IOsDriverExtension, _super);
    function IOsDriverExtension(_driver) {
        _super.call(this);
        this._driver = _driver;
    }
    Object.defineProperty(IOsDriverExtension, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _BINDINGS; },
        enumerable: true,
        configurable: true
    });
    IOsDriverExtension.prototype.gc = function () { throw new lang_1.BaseException('Force GC is not supported on iOS'); };
    IOsDriverExtension.prototype.timeBegin = function (name) {
        return this._driver.executeScript("console.time('" + name + "');");
    };
    IOsDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = "console.timeEnd('" + name + "');";
        if (lang_1.isPresent(restartName)) {
            script += "console.time('" + restartName + "');";
        }
        return this._driver.executeScript(script);
    };
    // See https://github.com/WebKit/webkit/tree/master/Source/WebInspectorUI/Versions
    IOsDriverExtension.prototype.readPerfLog = function () {
        var _this = this;
        // TODO(tbosch): Bug in IOsDriver: Need to execute at least one command
        // so that the browser logs can be read out!
        return this._driver.executeScript('1+1')
            .then(function (_) { return _this._driver.logs('performance'); })
            .then(function (entries) {
            var records = [];
            collection_1.ListWrapper.forEach(entries, function (entry) {
                var message = lang_1.Json.parse(entry['message'])['message'];
                if (lang_1.StringWrapper.equals(message['method'], 'Timeline.eventRecorded')) {
                    records.push(message['params']['record']);
                }
            });
            return _this._convertPerfRecordsToEvents(records);
        });
    };
    IOsDriverExtension.prototype._convertPerfRecordsToEvents = function (records, events) {
        var _this = this;
        if (events === void 0) { events = null; }
        if (lang_1.isBlank(events)) {
            events = [];
        }
        records.forEach(function (record) {
            var endEvent = null;
            var type = record['type'];
            var data = record['data'];
            var startTime = record['startTime'];
            var endTime = record['endTime'];
            if (lang_1.StringWrapper.equals(type, 'FunctionCall') &&
                (lang_1.isBlank(data) || !lang_1.StringWrapper.equals(data['scriptName'], 'InjectedScript'))) {
                events.push(createStartEvent('script', startTime));
                endEvent = createEndEvent('script', endTime);
            }
            else if (lang_1.StringWrapper.equals(type, 'Time')) {
                events.push(createMarkStartEvent(data['message'], startTime));
            }
            else if (lang_1.StringWrapper.equals(type, 'TimeEnd')) {
                events.push(createMarkEndEvent(data['message'], startTime));
            }
            else if (lang_1.StringWrapper.equals(type, 'RecalculateStyles') ||
                lang_1.StringWrapper.equals(type, 'Layout') ||
                lang_1.StringWrapper.equals(type, 'UpdateLayerTree') ||
                lang_1.StringWrapper.equals(type, 'Paint') || lang_1.StringWrapper.equals(type, 'Rasterize') ||
                lang_1.StringWrapper.equals(type, 'CompositeLayers')) {
                events.push(createStartEvent('render', startTime));
                endEvent = createEndEvent('render', endTime);
            }
            // Note: ios used to support GCEvent up until iOS 6 :-(
            if (lang_1.isPresent(record['children'])) {
                _this._convertPerfRecordsToEvents(record['children'], events);
            }
            if (lang_1.isPresent(endEvent)) {
                events.push(endEvent);
            }
        });
        return events;
    };
    IOsDriverExtension.prototype.perfLogFeatures = function () { return new web_driver_extension_1.PerfLogFeatures({ render: true }); };
    IOsDriverExtension.prototype.supports = function (capabilities) {
        return lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'safari');
    };
    return IOsDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.IOsDriverExtension = IOsDriverExtension;
function createEvent(ph, name, time, args) {
    if (args === void 0) { args = null; }
    var result = {
        'cat': 'timeline',
        'name': name,
        'ts': time,
        'ph': ph,
        // The ios protocol does not support the notions of multiple processes in
        // the perflog...
        'pid': 'pid0'
    };
    if (lang_1.isPresent(args)) {
        result['args'] = args;
    }
    return result;
}
function createStartEvent(name, time, args) {
    if (args === void 0) { args = null; }
    return createEvent('B', name, time, args);
}
function createEndEvent(name, time, args) {
    if (args === void 0) { args = null; }
    return createEvent('E', name, time, args);
}
function createMarkStartEvent(name, time) {
    return createEvent('b', name, time);
}
function createMarkEndEvent(name, time) {
    return createEvent('e', name, time);
}
var _BINDINGS = [
    di_1.bind(IOsDriverExtension)
        .toFactory(function (driver) { return new IOsDriverExtension(driver); }, [web_driver_adapter_1.WebDriverAdapter])
];

},{"../web_driver_adapter":20,"../web_driver_extension":21,"angular2/src/core/di":26,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],25:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var async_1 = require('angular2/src/core/facade/async');
var di_1 = require('angular2/src/core/di');
var web_driver_adapter_1 = require('../web_driver_adapter');
var webdriver = require('selenium-webdriver');
/**
 * Adapter for the selenium-webdriver.
 */
var SeleniumWebDriverAdapter = (function (_super) {
    __extends(SeleniumWebDriverAdapter, _super);
    function SeleniumWebDriverAdapter(_driver) {
        _super.call(this);
        this._driver = _driver;
    }
    Object.defineProperty(SeleniumWebDriverAdapter, "PROTRACTOR_BINDINGS", {
        get: function () { return _PROTRACTOR_BINDINGS; },
        enumerable: true,
        configurable: true
    });
    SeleniumWebDriverAdapter.prototype._convertPromise = function (thenable) {
        var completer = async_1.PromiseWrapper.completer();
        thenable.then(
        // selenium-webdriver uses an own Node.js context,
        // so we need to convert data into objects of this context.
        // (e.g. otherwise instanceof checks of rtts_assert would fail)
        // selenium-webdriver uses an own Node.js context,
        // so we need to convert data into objects of this context.
        // (e.g. otherwise instanceof checks of rtts_assert would fail)
        function (data) { return completer.resolve(convertToLocalProcess(data)); }, completer.reject);
        return completer.promise;
    };
    SeleniumWebDriverAdapter.prototype.waitFor = function (callback) {
        return this._convertPromise(this._driver.controlFlow().execute(callback));
    };
    SeleniumWebDriverAdapter.prototype.executeScript = function (script) {
        return this._convertPromise(this._driver.executeScript(script));
    };
    SeleniumWebDriverAdapter.prototype.executeAsyncScript = function (script) {
        return this._convertPromise(this._driver.executeAsyncScript(script));
    };
    SeleniumWebDriverAdapter.prototype.capabilities = function () {
        return this._convertPromise(this._driver.getCapabilities().then(function (capsObject) { return capsObject.toJSON(); }));
    };
    SeleniumWebDriverAdapter.prototype.logs = function (type) {
        // Needed as selenium-webdriver does not forward
        // performance logs in the correct way via manage().logs
        return this._convertPromise(this._driver.schedule(new webdriver.Command(webdriver.CommandName.GET_LOG).setParameter('type', type), 'WebDriver.manage().logs().get(' + type + ')'));
    };
    return SeleniumWebDriverAdapter;
})(web_driver_adapter_1.WebDriverAdapter);
exports.SeleniumWebDriverAdapter = SeleniumWebDriverAdapter;
function convertToLocalProcess(data) {
    var serialized = JSON.stringify(data);
    if ('' + serialized === 'undefined') {
        return undefined;
    }
    return JSON.parse(serialized);
}
var _PROTRACTOR_BINDINGS = [
    di_1.bind(web_driver_adapter_1.WebDriverAdapter)
        .toFactory(function () { return new SeleniumWebDriverAdapter(global.browser); }, [])
];

},{"../web_driver_adapter":20,"angular2/src/core/di":26,"angular2/src/core/facade/async":36,"selenium-webdriver":undefined}],26:[function(require,module,exports){
'use strict';/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var metadata_1 = require('./di/metadata');
exports.InjectMetadata = metadata_1.InjectMetadata;
exports.OptionalMetadata = metadata_1.OptionalMetadata;
exports.InjectableMetadata = metadata_1.InjectableMetadata;
exports.SelfMetadata = metadata_1.SelfMetadata;
exports.HostMetadata = metadata_1.HostMetadata;
exports.SkipSelfMetadata = metadata_1.SkipSelfMetadata;
exports.DependencyMetadata = metadata_1.DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
__export(require('./di/decorators'));
var forward_ref_1 = require('./di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./di/injector');
exports.Injector = injector_1.Injector;
exports.ProtoInjector = injector_1.ProtoInjector;
exports.BindingWithVisibility = injector_1.BindingWithVisibility;
exports.Visibility = injector_1.Visibility;
exports.UNDEFINED = injector_1.UNDEFINED;
var binding_1 = require('./di/binding');
exports.Binding = binding_1.Binding;
exports.BindingBuilder = binding_1.BindingBuilder;
exports.ResolvedBinding = binding_1.ResolvedBinding;
exports.ResolvedFactory = binding_1.ResolvedFactory;
exports.Dependency = binding_1.Dependency;
exports.bind = binding_1.bind;
var key_1 = require('./di/key');
exports.Key = key_1.Key;
exports.KeyRegistry = key_1.KeyRegistry;
exports.TypeLiteral = key_1.TypeLiteral;
var exceptions_1 = require('./di/exceptions');
exports.NoBindingError = exceptions_1.NoBindingError;
exports.AbstractBindingError = exceptions_1.AbstractBindingError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidBindingError = exceptions_1.InvalidBindingError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
exports.OutOfBoundsError = exceptions_1.OutOfBoundsError;
var opaque_token_1 = require('./di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;

},{"./di/binding":27,"./di/decorators":28,"./di/exceptions":29,"./di/forward_ref":30,"./di/injector":31,"./di/key":32,"./di/metadata":33,"./di/opaque_token":34}],27:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
var exceptions_1 = require('./exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * @private
 */
var Dependency = (function () {
    function Dependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    Dependency.fromKey = function (key) { return new Dependency(key, false, null, null, []); };
    return Dependency;
})();
exports.Dependency = Dependency;
var _EMPTY_LIST = lang_1.CONST_EXPR([]);
/**
 * Describes how_ the {@link Injector} should instantiate a given token.
 *
 * See {@link bind}.
 *
 * ## Example
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Binding(String, { toValue: 'Hello' })
 * ]);
 *
 * expect(injector.get(String)).toEqual('Hello');
 * ```
 */
var Binding = (function () {
    function Binding(token, _a) {
        var toClass = _a.toClass, toValue = _a.toValue, toAlias = _a.toAlias, toFactory = _a.toFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.toClass = toClass;
        this.toValue = toValue;
        this.toAlias = toAlias;
        this.toFactory = toFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
    Object.defineProperty(Binding.prototype, "multi", {
        /**
         * Used to create multiple bindings matching the same token.
         *
         * ## Example
         *
         * ```javascript
         * var injector = Injector.resolveAndCreate([
         *   new Binding("Strings", { toValue: "String1", multi: true}),
         *   new Binding("Strings", { toValue: "String2", multi: true})
         * ]);
         *
         * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
         * ```
         *
         * Multi bindings and regular bindings cannot be mixed. The following
         * will throw an exception:
         *
         * ```javascript
         * var injector = Injector.resolveAndCreate([
         *   new Binding("Strings", { toValue: "String1", multi: true}),
         *   new Binding("Strings", { toValue: "String2"})
         * ]);
         * ```
         */
        get: function () { return lang_1.normalizeBool(this._multi); },
        enumerable: true,
        configurable: true
    });
    Binding = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Binding);
    return Binding;
})();
exports.Binding = Binding;
/**
 * An internal resolved representation of a {@link Binding} used by the {@link Injector}.
 *
 * A {@link Binding} is resolved when it has a factory function. Binding to a class, alias, or
 * value, are just convenience methods, as {@link Injector} only operates on calling factory
 * functions.
 */
var ResolvedBinding = (function () {
    function ResolvedBinding(
        /**
         * A key, usually a `Type`.
         */
        key, 
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        resolvedFactories, multiBinding) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiBinding = multiBinding;
    }
    Object.defineProperty(ResolvedBinding.prototype, "resolvedFactory", {
        get: function () { return this.resolvedFactories[0]; },
        enumerable: true,
        configurable: true
    });
    return ResolvedBinding;
})();
exports.ResolvedBinding = ResolvedBinding;
var ResolvedFactory = (function () {
    function ResolvedFactory(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        factory, 
        /**
         * Arguments (dependencies) to the `factory` function.
         */
        dependencies) {
        this.factory = factory;
        this.dependencies = dependencies;
    }
    return ResolvedFactory;
})();
exports.ResolvedFactory = ResolvedFactory;
/**
 * Provides an API for imperatively constructing {@link Binding}s.
 *
 * This is only relevant for JavaScript. See {@link BindingBuilder}.
 *
 * ## Example
 *
 * ```javascript
 * bind(MyInterface).toClass(MyClass)
 *
 * ```
 */
function bind(token) {
    return new BindingBuilder(token);
}
exports.bind = bind;
/**
 * Helper class for the {@link bind} function.
 */
var BindingBuilder = (function () {
    function BindingBuilder(token) {
        this.token = token;
    }
    /**
     * Binds an interface to an implementation / subclass.
     *
     * ## Example
     *
     * Because `toAlias` and `toClass` are often confused, the example contains both use cases for
     * easy comparison.
     *
     * ```javascript
     *
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   bind(Vehicle).toClass(Car)
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   bind(Vehicle).toAlias(Car)
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    BindingBuilder.prototype.toClass = function (type) { return new Binding(this.token, { toClass: type }); };
    /**
     * Binds a key to a value.
     *
     * ## Example
     *
     * ```javascript
     * var injector = Injector.resolveAndCreate([
     *   bind(String).toValue('Hello')
     * ]);
     *
     * expect(injector.get(String)).toEqual('Hello');
     * ```
     */
    BindingBuilder.prototype.toValue = function (value) { return new Binding(this.token, { toValue: value }); };
    /**
     * Binds a key to the alias for an existing key.
     *
     * An alias means that we will return the same instance as if the alias token was used. (This is
     * in contrast to `toClass` where a separate instance of `toClass` will be returned.)
     *
     * ## Example
     *
     * Becuse `toAlias` and `toClass` are often confused, the example contains both use cases for easy
     * comparison.
     *
     * ```javascript
     *
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   bind(Vehicle).toAlias(Car)
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   bind(Vehicle).toClass(Car)
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    BindingBuilder.prototype.toAlias = function (aliasToken) {
        if (lang_1.isBlank(aliasToken)) {
            throw new lang_1.BaseException("Can not alias " + lang_1.stringify(this.token) + " to a blank value!");
        }
        return new Binding(this.token, { toAlias: aliasToken });
    };
    /**
     * Binds a key to a function which computes the value.
     *
     * ## Example
     *
     * ```javascript
     * var injector = Injector.resolveAndCreate([
     *   bind(Number).toFactory(() => { return 1+2; }),
     *   bind(String).toFactory((v) => { return "Value: " + v; }, [Number])
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    BindingBuilder.prototype.toFactory = function (factoryFunction, dependencies) {
        return new Binding(this.token, { toFactory: factoryFunction, deps: dependencies });
    };
    return BindingBuilder;
})();
exports.BindingBuilder = BindingBuilder;
/**
 * Resolve a single binding.
 */
function resolveFactory(binding) {
    var factoryFn;
    var resolvedDeps;
    if (lang_1.isPresent(binding.toClass)) {
        var toClass = forward_ref_1.resolveForwardRef(binding.toClass);
        factoryFn = reflection_1.reflector.factory(toClass);
        resolvedDeps = _dependenciesFor(toClass);
    }
    else if (lang_1.isPresent(binding.toAlias)) {
        factoryFn = function (aliasInstance) { return aliasInstance; };
        resolvedDeps = [Dependency.fromKey(key_1.Key.get(binding.toAlias))];
    }
    else if (lang_1.isPresent(binding.toFactory)) {
        factoryFn = binding.toFactory;
        resolvedDeps = _constructDependencies(binding.toFactory, binding.dependencies);
    }
    else {
        factoryFn = function () { return binding.toValue; };
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
exports.resolveFactory = resolveFactory;
/**
 * Converts the {@link Binding} into {@link ResolvedBinding}.
 *
 * {@link Injector} internally only uses {@link ResolvedBinding}, {@link Binding} contains
 * convenience binding syntax.
 */
function resolveBinding(binding) {
    return new ResolvedBinding(key_1.Key.get(binding.token), [resolveFactory(binding)], false);
}
exports.resolveBinding = resolveBinding;
/**
 * Resolve a list of Bindings.
 */
function resolveBindings(bindings) {
    var normalized = _createListOfBindings(_normalizeBindings(bindings, new Map()));
    return normalized.map(function (b) {
        if (b instanceof _NormalizedBinding) {
            return new ResolvedBinding(b.key, [b.resolvedFactory], false);
        }
        else {
            var arr = b;
            return new ResolvedBinding(arr[0].key, arr.map(function (_) { return _.resolvedFactory; }), true);
        }
    });
}
exports.resolveBindings = resolveBindings;
/**
 * The algorithm works as follows:
 *
 * [Binding] -> [_NormalizedBinding|[_NormalizedBinding]] -> [ResolvedBinding]
 *
 * _NormalizedBinding is essentially a resolved binding before it was grouped by key.
 */
var _NormalizedBinding = (function () {
    function _NormalizedBinding(key, resolvedFactory) {
        this.key = key;
        this.resolvedFactory = resolvedFactory;
    }
    return _NormalizedBinding;
})();
function _createListOfBindings(flattenedBindings) {
    return collection_1.MapWrapper.values(flattenedBindings);
}
function _normalizeBindings(bindings, res) {
    collection_1.ListWrapper.forEach(bindings, function (b) {
        if (b instanceof lang_1.Type) {
            _normalizeBinding(bind(b).toClass(b), res);
        }
        else if (b instanceof Binding) {
            _normalizeBinding(b, res);
        }
        else if (b instanceof Array) {
            _normalizeBindings(b, res);
        }
        else if (b instanceof BindingBuilder) {
            throw new exceptions_1.InvalidBindingError(b.token);
        }
        else {
            throw new exceptions_1.InvalidBindingError(b);
        }
    });
    return res;
}
function _normalizeBinding(b, res) {
    var key = key_1.Key.get(b.token);
    var factory = resolveFactory(b);
    var normalized = new _NormalizedBinding(key, factory);
    if (b.multi) {
        var existingBinding = res.get(key.id);
        if (existingBinding instanceof Array) {
            existingBinding.push(normalized);
        }
        else if (lang_1.isBlank(existingBinding)) {
            res.set(key.id, [normalized]);
        }
        else {
            throw new exceptions_1.MixingMultiBindingsWithRegularBindings(existingBinding, b);
        }
    }
    else {
        var existingBinding = res.get(key.id);
        if (existingBinding instanceof Array) {
            throw new exceptions_1.MixingMultiBindingsWithRegularBindings(existingBinding, b);
        }
        res.set(key.id, normalized);
    }
}
function _constructDependencies(factoryFunction, dependencies) {
    if (lang_1.isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = collection_1.ListWrapper.map(dependencies, function (t) { return [t]; });
        return collection_1.ListWrapper.map(dependencies, function (t) { return _extractToken(factoryFunction, t, params); });
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflection_1.reflector.parameters(typeOrFunc);
    if (lang_1.isBlank(params))
        return [];
    if (collection_1.ListWrapper.any(params, function (p) { return lang_1.isBlank(p); })) {
        throw new exceptions_1.NoAnnotationError(typeOrFunc, params);
    }
    return collection_1.ListWrapper.map(params, function (p) { return _extractToken(typeOrFunc, p, params); });
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!lang_1.isArray(metadata)) {
        return _createDependency(metadata, optional, null, null, depProps);
    }
    var lowerBoundVisibility = null;
    var upperBoundVisibility = null;
    for (var i = 0; i < metadata.length; ++i) {
        var paramMetadata = metadata[i];
        if (paramMetadata instanceof lang_1.Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof metadata_1.OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof metadata_1.SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.DependencyMetadata) {
            if (lang_1.isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = forward_ref_1.resolveForwardRef(token);
    if (lang_1.isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new exceptions_1.NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(key_1.Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}

},{"./exceptions":29,"./forward_ref":30,"./key":32,"./metadata":33,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38,"angular2/src/core/reflection/reflection":40}],28:[function(require,module,exports){
'use strict';var metadata_1 = require('./metadata');
var decorators_1 = require('../util/decorators');
/**
 * Factory for creating {@link InjectMetadata}.
 */
exports.Inject = decorators_1.makeParamDecorator(metadata_1.InjectMetadata);
/**
 * Factory for creating {@link OptionalMetadata}.
 */
exports.Optional = decorators_1.makeParamDecorator(metadata_1.OptionalMetadata);
/**
 * Factory for creating {@link InjectableMetadata}.
 */
exports.Injectable = decorators_1.makeDecorator(metadata_1.InjectableMetadata);
/**
 * Factory for creating {@link SelfMetadata}.
 */
exports.Self = decorators_1.makeParamDecorator(metadata_1.SelfMetadata);
/**
 * Factory for creating {@link HostMetadata}.
 */
exports.Host = decorators_1.makeParamDecorator(metadata_1.HostMetadata);
/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
exports.SkipSelf = decorators_1.makeParamDecorator(metadata_1.SkipSelfMetadata);

},{"../util/decorators":43,"./metadata":33}],29:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var collection_1 = require('angular2/src/core/facade/collection');
var lang_1 = require('angular2/src/core/facade/lang');
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (collection_1.ListWrapper.contains(res, keys[i])) {
            res.push(keys[i]);
            return res;
        }
        else {
            res.push(keys[i]);
        }
    }
    return res;
}
function constructResolvingPath(keys) {
    if (keys.length > 1) {
        var reversed = findFirstClosedCycle(collection_1.ListWrapper.reversed(keys));
        var tokenStrs = collection_1.ListWrapper.map(reversed, function (k) { return lang_1.stringify(k.token); });
        return " (" + tokenStrs.join(' -> ') + ")";
    }
    else {
        return "";
    }
}
/**
 * Base class for all errors arising from misconfigured bindings.
 */
var AbstractBindingError = (function (_super) {
    __extends(AbstractBindingError, _super);
    function AbstractBindingError(injector, key, constructResolvingMessage, originalException, originalStack) {
        _super.call(this, "DI Exception", originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    AbstractBindingError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    };
    Object.defineProperty(AbstractBindingError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    AbstractBindingError.prototype.toString = function () { return this.message; };
    return AbstractBindingError;
})(lang_1.BaseException);
exports.AbstractBindingError = AbstractBindingError;
/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Binding} for {@link Key}.
 */
var NoBindingError = (function (_super) {
    __extends(NoBindingError, _super);
    function NoBindingError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            var first = lang_1.stringify(collection_1.ListWrapper.first(keys).token);
            return "No provider for " + first + "!" + constructResolvingPath(keys);
        });
    }
    return NoBindingError;
})(AbstractBindingError);
exports.NoBindingError = NoBindingError;
/**
 * Thrown when dependencies form a cycle.
 *
 * ## Example:
 *
 * ```javascript
 * class A {
 *   constructor(b:B) {}
 * }
 * class B {
 *   constructor(a:A) {}
 * }
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
var CyclicDependencyError = (function (_super) {
    __extends(CyclicDependencyError, _super);
    function CyclicDependencyError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
        });
    }
    return CyclicDependencyError;
})(AbstractBindingError);
exports.CyclicDependencyError = CyclicDependencyError;
/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 */
var InstantiationError = (function (_super) {
    __extends(InstantiationError, _super);
    function InstantiationError(injector, originalException, originalStack, key) {
        _super.call(this, injector, key, function (keys) {
            var first = lang_1.stringify(collection_1.ListWrapper.first(keys).token);
            return "Error during instantiation of " + first + "!" + constructResolvingPath(keys) + ".";
        }, originalException, originalStack);
        this.causeKey = key;
    }
    return InstantiationError;
})(AbstractBindingError);
exports.InstantiationError = InstantiationError;
/**
 * Thrown when an object other then {@link Binding} (or `Type`) is passed to {@link Injector}
 * creation.
 */
var InvalidBindingError = (function (_super) {
    __extends(InvalidBindingError, _super);
    function InvalidBindingError(binding) {
        _super.call(this);
        this.message = "Invalid binding - only instances of Binding and Type are allowed, got: " +
            binding.toString();
    }
    InvalidBindingError.prototype.toString = function () { return this.message; };
    return InvalidBindingError;
})(lang_1.BaseException);
exports.InvalidBindingError = InvalidBindingError;
/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 */
var NoAnnotationError = (function (_super) {
    __extends(NoAnnotationError, _super);
    function NoAnnotationError(typeOrFunc, params) {
        _super.call(this);
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (lang_1.isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(collection_1.ListWrapper.map(parameter, lang_1.stringify).join(' '));
            }
        }
        this.message = "Cannot resolve all parameters for " + lang_1.stringify(typeOrFunc) + "(" +
            signature.join(', ') + "). " +
            'Make sure they all have valid type or annotations.';
    }
    NoAnnotationError.prototype.toString = function () { return this.message; };
    return NoAnnotationError;
})(lang_1.BaseException);
exports.NoAnnotationError = NoAnnotationError;
/**
 * Thrown when getting an object by index.
 */
var OutOfBoundsError = (function (_super) {
    __extends(OutOfBoundsError, _super);
    function OutOfBoundsError(index) {
        _super.call(this);
        this.message = "Index " + index + " is out-of-bounds.";
    }
    OutOfBoundsError.prototype.toString = function () { return this.message; };
    return OutOfBoundsError;
})(lang_1.BaseException);
exports.OutOfBoundsError = OutOfBoundsError;
/**
 * Thrown when a multi binding and a regular binding are bound to the same token.
 */
var MixingMultiBindingsWithRegularBindings = (function (_super) {
    __extends(MixingMultiBindingsWithRegularBindings, _super);
    function MixingMultiBindingsWithRegularBindings(binding1, binding2) {
        _super.call(this);
        this.message = "Cannot mix multi bindings and regular bindings, got: " + binding1.toString() +
            " " + binding2.toString();
    }
    MixingMultiBindingsWithRegularBindings.prototype.toString = function () { return this.message; };
    return MixingMultiBindingsWithRegularBindings;
})(lang_1.BaseException);
exports.MixingMultiBindingsWithRegularBindings = MixingMultiBindingsWithRegularBindings;

},{"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],30:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
/**
 * Allows to refer to references which are not yet defined.
 *
 * This situation arises when the key which we need te refer to for the purposes of DI is declared,
 * but not yet defined.
 *
 * ## Example:
 *
 * ```
 * class Door {
 *   // Incorrect way to refer to a reference which is defined later.
 *   // This fails because `Lock` is undefined at this point.
 *   constructor(lock:Lock) { }
 *
 *   // Correct way to refer to a reference which is defined later.
 *   // The reference needs to be captured in a closure.
 *   constructor(@Inject(forwardRef(() => Lock)) lock:Lock) { }
 * }
 *
 * // Only at this point the lock is defined.
 * class Lock {
 * }
 * ```
 */
function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function () { return lang_1.stringify(this()); };
    return forwardRefFn;
}
exports.forwardRef = forwardRef;
/**
 * Lazily retrieve the reference value.
 *
 * See: {@link forwardRef}
 */
function resolveForwardRef(type) {
    if (lang_1.isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
        type.__forward_ref__ === forwardRef) {
        return type();
    }
    else {
        return type;
    }
}
exports.resolveForwardRef = resolveForwardRef;

},{"angular2/src/core/facade/lang":38}],31:[function(require,module,exports){
'use strict';var collection_1 = require('angular2/src/core/facade/collection');
var binding_1 = require('./binding');
var exceptions_1 = require('./exceptions');
var lang_1 = require('angular2/src/core/facade/lang');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
// Threshold for the dynamic version
var _MAX_CONSTRUCTION_COUNTER = 10;
exports.UNDEFINED = lang_1.CONST_EXPR(new Object());
(function (Visibility) {
    Visibility[Visibility["Public"] = 0] = "Public";
    Visibility[Visibility["Private"] = 1] = "Private";
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
})(exports.Visibility || (exports.Visibility = {}));
var Visibility = exports.Visibility;
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
var ProtoInjectorInlineStrategy = (function () {
    function ProtoInjectorInlineStrategy(protoEI, bwv) {
        this.binding0 = null;
        this.binding1 = null;
        this.binding2 = null;
        this.binding3 = null;
        this.binding4 = null;
        this.binding5 = null;
        this.binding6 = null;
        this.binding7 = null;
        this.binding8 = null;
        this.binding9 = null;
        this.keyId0 = null;
        this.keyId1 = null;
        this.keyId2 = null;
        this.keyId3 = null;
        this.keyId4 = null;
        this.keyId5 = null;
        this.keyId6 = null;
        this.keyId7 = null;
        this.keyId8 = null;
        this.keyId9 = null;
        this.visibility0 = null;
        this.visibility1 = null;
        this.visibility2 = null;
        this.visibility3 = null;
        this.visibility4 = null;
        this.visibility5 = null;
        this.visibility6 = null;
        this.visibility7 = null;
        this.visibility8 = null;
        this.visibility9 = null;
        var length = bwv.length;
        if (length > 0) {
            this.binding0 = bwv[0].binding;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
        }
        if (length > 1) {
            this.binding1 = bwv[1].binding;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
        }
        if (length > 2) {
            this.binding2 = bwv[2].binding;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
        }
        if (length > 3) {
            this.binding3 = bwv[3].binding;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
        }
        if (length > 4) {
            this.binding4 = bwv[4].binding;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
        }
        if (length > 5) {
            this.binding5 = bwv[5].binding;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
        }
        if (length > 6) {
            this.binding6 = bwv[6].binding;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
        }
        if (length > 7) {
            this.binding7 = bwv[7].binding;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
        }
        if (length > 8) {
            this.binding8 = bwv[8].binding;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
        }
        if (length > 9) {
            this.binding9 = bwv[9].binding;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
        }
    }
    ProtoInjectorInlineStrategy.prototype.getBindingAtIndex = function (index) {
        if (index == 0)
            return this.binding0;
        if (index == 1)
            return this.binding1;
        if (index == 2)
            return this.binding2;
        if (index == 3)
            return this.binding3;
        if (index == 4)
            return this.binding4;
        if (index == 5)
            return this.binding5;
        if (index == 6)
            return this.binding6;
        if (index == 7)
            return this.binding7;
        if (index == 8)
            return this.binding8;
        if (index == 9)
            return this.binding9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    ProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
        return new InjectorInlineStrategy(injector, this);
    };
    return ProtoInjectorInlineStrategy;
})();
exports.ProtoInjectorInlineStrategy = ProtoInjectorInlineStrategy;
var ProtoInjectorDynamicStrategy = (function () {
    function ProtoInjectorDynamicStrategy(protoInj, bwv) {
        var len = bwv.length;
        this.bindings = collection_1.ListWrapper.createFixedSize(len);
        this.keyIds = collection_1.ListWrapper.createFixedSize(len);
        this.visibilities = collection_1.ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.bindings[i] = bwv[i].binding;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    ProtoInjectorDynamicStrategy.prototype.getBindingAtIndex = function (index) {
        if (index < 0 || index >= this.bindings.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.bindings[index];
    };
    ProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
        return new InjectorDynamicStrategy(this, ei);
    };
    return ProtoInjectorDynamicStrategy;
})();
exports.ProtoInjectorDynamicStrategy = ProtoInjectorDynamicStrategy;
var ProtoInjector = (function () {
    function ProtoInjector(bwv) {
        this.numberOfBindings = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    ProtoInjector.prototype.getBindingAtIndex = function (index) { return this._strategy.getBindingAtIndex(index); };
    return ProtoInjector;
})();
exports.ProtoInjector = ProtoInjector;
var InjectorInlineStrategy = (function () {
    function InjectorInlineStrategy(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = exports.UNDEFINED;
        this.obj1 = exports.UNDEFINED;
        this.obj2 = exports.UNDEFINED;
        this.obj3 = exports.UNDEFINED;
        this.obj4 = exports.UNDEFINED;
        this.obj5 = exports.UNDEFINED;
        this.obj6 = exports.UNDEFINED;
        this.obj7 = exports.UNDEFINED;
        this.obj8 = exports.UNDEFINED;
        this.obj9 = exports.UNDEFINED;
    }
    InjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorInlineStrategy.prototype.instantiateBinding = function (binding, visibility) {
        return this.injector._new(binding, visibility);
    };
    InjectorInlineStrategy.prototype.attach = function (parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    };
    InjectorInlineStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === exports.UNDEFINED) {
                this.obj0 = inj._new(p.binding0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === exports.UNDEFINED) {
                this.obj1 = inj._new(p.binding1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === exports.UNDEFINED) {
                this.obj2 = inj._new(p.binding2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === exports.UNDEFINED) {
                this.obj3 = inj._new(p.binding3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === exports.UNDEFINED) {
                this.obj4 = inj._new(p.binding4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === exports.UNDEFINED) {
                this.obj5 = inj._new(p.binding5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === exports.UNDEFINED) {
                this.obj6 = inj._new(p.binding6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === exports.UNDEFINED) {
                this.obj7 = inj._new(p.binding7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === exports.UNDEFINED) {
                this.obj8 = inj._new(p.binding8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === exports.UNDEFINED) {
                this.obj9 = inj._new(p.binding9, p.visibility9);
            }
            return this.obj9;
        }
        return exports.UNDEFINED;
    };
    InjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
        if (index == 0)
            return this.obj0;
        if (index == 1)
            return this.obj1;
        if (index == 2)
            return this.obj2;
        if (index == 3)
            return this.obj3;
        if (index == 4)
            return this.obj4;
        if (index == 5)
            return this.obj5;
        if (index == 6)
            return this.obj6;
        if (index == 7)
            return this.obj7;
        if (index == 8)
            return this.obj8;
        if (index == 9)
            return this.obj9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    InjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
    return InjectorInlineStrategy;
})();
exports.InjectorInlineStrategy = InjectorInlineStrategy;
var InjectorDynamicStrategy = (function () {
    function InjectorDynamicStrategy(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = collection_1.ListWrapper.createFixedSize(protoStrategy.bindings.length);
        collection_1.ListWrapper.fill(this.objs, exports.UNDEFINED);
    }
    InjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorDynamicStrategy.prototype.instantiateBinding = function (binding, visibility) {
        return this.injector._new(binding, visibility);
    };
    InjectorDynamicStrategy.prototype.attach = function (parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    };
    InjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === exports.UNDEFINED) {
                    this.objs[i] = this.injector._new(p.bindings[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return exports.UNDEFINED;
    };
    InjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
        if (index < 0 || index >= this.objs.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.objs[index];
    };
    InjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
    return InjectorDynamicStrategy;
})();
exports.InjectorDynamicStrategy = InjectorDynamicStrategy;
var BindingWithVisibility = (function () {
    function BindingWithVisibility(binding, visibility) {
        this.binding = binding;
        this.visibility = visibility;
    }
    ;
    BindingWithVisibility.prototype.getKeyId = function () { return this.binding.key.id; };
    return BindingWithVisibility;
})();
exports.BindingWithVisibility = BindingWithVisibility;
/**
 * A dependency injection container used for resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ## Example:
 *
 * Suppose that we want to inject an `Engine` into class `Car`, we would define it like this:
 *
 * ```javascript
 * class Engine {
 * }
 *
 * class Car {
 *   constructor(@Inject(Engine) engine) {
 *   }
 * }
 *
 * ```
 *
 * Next we need to write the code that creates and instantiates the `Injector`. We then ask for the
 * `root` object, `Car`, so that the `Injector` can recursively build all of that object's
 *dependencies.
 *
 * ```javascript
 * main() {
 *   var injector = Injector.resolveAndCreate([Car, Engine]);
 *
 *   // Get a reference to the `root` object, which will recursively instantiate the tree.
 *   var car = injector.get(Car);
 * }
 * ```
 * Notice that we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
var Injector = (function () {
    function Injector(_proto, _parent, _depProvider, _debugContext) {
        if (_parent === void 0) { _parent = null; }
        if (_depProvider === void 0) { _depProvider = null; }
        if (_debugContext === void 0) { _debugContext = null; }
        this._proto = _proto;
        this._parent = _parent;
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
        this._isHost = false;
        this._constructionCounter = 0;
        this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
    /**
     * Turns a list of binding definitions into an internal resolved list of resolved bindings.
     *
     * A resolution is a process of flattening multiple nested lists and converting individual
     * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
     * for the {@link Injector} for performance-sensitive code.
     *
     * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
     * recursive list of more bindings.
     *
     * The returned list is sparse, indexed by `id` for the {@link Key}. It is generally not useful to
     *application code
     * other than for passing it to {@link Injector} functions that require resolved binding lists,
     *such as
     * `fromResolvedBindings` and `createChildFromResolved`.
     */
    Injector.resolve = function (bindings) {
        return binding_1.resolveBindings(bindings);
    };
    /**
     * Resolves bindings and creates an injector based on those bindings. This function is slower than
     * the corresponding `fromResolvedBindings` because it needs to resolve bindings first. See
     *`resolve`
     * for the {@link Injector}.
     *
     * Prefer `fromResolvedBindings` in performance-critical code that creates lots of injectors.
     *
     * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
     *recursive list of more
     * bindings.
     * @param `depProvider`
     */
    Injector.resolveAndCreate = function (bindings, depProvider) {
        if (depProvider === void 0) { depProvider = null; }
        var resolvedBindings = Injector.resolve(bindings);
        return Injector.fromResolvedBindings(resolvedBindings, depProvider);
    };
    /**
     * Creates an injector from previously resolved bindings. This bypasses resolution and flattening.
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * @param `bindings` A sparse list of {@link ResolvedBinding}s. See `resolve` for the
     * {@link Injector}.
     * @param `depProvider`
     */
    Injector.fromResolvedBindings = function (bindings, depProvider) {
        if (depProvider === void 0) { depProvider = null; }
        var bd = bindings.map(function (b) { return new BindingWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto, null, depProvider);
        return inj;
    };
    /**
     * Returns debug information about the injector.
     *
     * This information is included into exceptions thrown by the injector.
     */
    Injector.prototype.debugContext = function () { return this._debugContext(); };
    /**
     * Retrieves an instance from the injector.
     *
     * @param `token`: usually the `Type` of an object. (Same as the token used while setting up a
     *binding).
     * @returns an instance represented by the token. Throws if not found.
     */
    Injector.prototype.get = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    };
    /**
     * Retrieves an instance from the injector.
     *
     * @param `token`: usually a `Type`. (Same as the token used while setting up a binding).
     * @returns an instance represented by the token. Returns `null` if not found.
     */
    Injector.prototype.getOptional = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    };
    /**
     * Retrieves an instance from the injector.
     *
     * @param `index`: index of an instance.
     * @returns an instance represented by the index. Throws if not found.
     */
    Injector.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
    Object.defineProperty(Injector.prototype, "parent", {
        /**
         * Direct parent of this injector.
         */
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injector.prototype, "internalStrategy", {
        /**
         * Internal. Do not use.
         *
         * We return `any` not to export the InjectorStrategy type.
         */
        get: function () { return this._strategy; },
        enumerable: true,
        configurable: true
    });
    /**
    * Creates a child injector and loads a new set of bindings into it.
    *
    * A resolution is a process of flattening multiple nested lists and converting individual
    * bindings into a list of {@link ResolvedBinding}s. The resolution can be cached by `resolve`
    * for the {@link Injector} for performance-sensitive code.
    *
    * @param `bindings` can be a list of `Type`, {@link Binding}, {@link ResolvedBinding}, or a
    * recursive list of more bindings.
    * @param `depProvider`
    */
    Injector.prototype.resolveAndCreateChild = function (bindings, depProvider) {
        if (depProvider === void 0) { depProvider = null; }
        var resolvedBindings = Injector.resolve(bindings);
        return this.createChildFromResolved(resolvedBindings, depProvider);
    };
    /**
     * Creates a child injector and loads a new set of {@link ResolvedBinding}s into it.
     *
     * @param `bindings`: A sparse list of {@link ResolvedBinding}s.
     * See `resolve` for the {@link Injector}.
     * @param `depProvider`
     * @returns a new child {@link Injector}.
     */
    Injector.prototype.createChildFromResolved = function (bindings, depProvider) {
        if (depProvider === void 0) { depProvider = null; }
        var bd = bindings.map(function (b) { return new BindingWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto, null, depProvider);
        inj._parent = this;
        return inj;
    };
    /**
     * Resolves a binding and instantiates an object in the context of the injector.
     *
     * @param `binding`: either a type or a binding.
     * @returns an object created using binding.
     */
    Injector.prototype.resolveAndInstantiate = function (binding) {
        return this.instantiateResolved(Injector.resolve([binding])[0]);
    };
    /**
     * Instantiates an object using a resolved binding in the context of the injector.
     *
     * @param `binding`: a resolved binding
     * @returns an object created using binding.
     */
    Injector.prototype.instantiateResolved = function (binding) {
        return this._instantiateBinding(binding, Visibility.PublicAndPrivate);
    };
    Injector.prototype._new = function (binding, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new exceptions_1.CyclicDependencyError(this, binding.key);
        }
        return this._instantiateBinding(binding, visibility);
    };
    Injector.prototype._instantiateBinding = function (binding, visibility) {
        if (binding.multiBinding) {
            var res = collection_1.ListWrapper.createFixedSize(binding.resolvedFactories.length);
            for (var i = 0; i < binding.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(binding, binding.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(binding, binding.resolvedFactories[0], visibility);
        }
    };
    Injector.prototype._instantiate = function (binding, resolvedFactory, visibility) {
        var factory = resolvedFactory.factory;
        var deps = resolvedFactory.dependencies;
        var length = deps.length;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19;
        try {
            d0 = length > 0 ? this._getByDependency(binding, deps[0], visibility) : null;
            d1 = length > 1 ? this._getByDependency(binding, deps[1], visibility) : null;
            d2 = length > 2 ? this._getByDependency(binding, deps[2], visibility) : null;
            d3 = length > 3 ? this._getByDependency(binding, deps[3], visibility) : null;
            d4 = length > 4 ? this._getByDependency(binding, deps[4], visibility) : null;
            d5 = length > 5 ? this._getByDependency(binding, deps[5], visibility) : null;
            d6 = length > 6 ? this._getByDependency(binding, deps[6], visibility) : null;
            d7 = length > 7 ? this._getByDependency(binding, deps[7], visibility) : null;
            d8 = length > 8 ? this._getByDependency(binding, deps[8], visibility) : null;
            d9 = length > 9 ? this._getByDependency(binding, deps[9], visibility) : null;
            d10 = length > 10 ? this._getByDependency(binding, deps[10], visibility) : null;
            d11 = length > 11 ? this._getByDependency(binding, deps[11], visibility) : null;
            d12 = length > 12 ? this._getByDependency(binding, deps[12], visibility) : null;
            d13 = length > 13 ? this._getByDependency(binding, deps[13], visibility) : null;
            d14 = length > 14 ? this._getByDependency(binding, deps[14], visibility) : null;
            d15 = length > 15 ? this._getByDependency(binding, deps[15], visibility) : null;
            d16 = length > 16 ? this._getByDependency(binding, deps[16], visibility) : null;
            d17 = length > 17 ? this._getByDependency(binding, deps[17], visibility) : null;
            d18 = length > 18 ? this._getByDependency(binding, deps[18], visibility) : null;
            d19 = length > 19 ? this._getByDependency(binding, deps[19], visibility) : null;
        }
        catch (e) {
            if (e instanceof exceptions_1.AbstractBindingError) {
                e.addKey(this, binding.key);
            }
            throw e;
        }
        var obj;
        try {
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
                case 11:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                    break;
                case 12:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                    break;
                case 13:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                    break;
                case 14:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                    break;
                case 15:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                    break;
                case 16:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                    break;
                case 17:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                    break;
                case 18:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                    break;
                case 19:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                    break;
                case 20:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                    break;
            }
        }
        catch (e) {
            throw new exceptions_1.InstantiationError(this, e, e.stack, binding.key);
        }
        return obj;
    };
    Injector.prototype._getByDependency = function (binding, dep, bindingVisibility) {
        var special = lang_1.isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, binding, dep) :
            exports.UNDEFINED;
        if (special !== exports.UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, bindingVisibility);
        }
    };
    Injector.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, optional, bindingVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof metadata_1.SelfMetadata) {
            return this._getByKeySelf(key, optional, bindingVisibility);
        }
        else if (upperBoundVisibility instanceof metadata_1.HostMetadata) {
            return this._getByKeyHost(key, optional, bindingVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, bindingVisibility, lowerBoundVisibility);
        }
    };
    Injector.prototype._throwOrNull = function (key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new exceptions_1.NoBindingError(this, key);
        }
    };
    Injector.prototype._getByKeySelf = function (key, optional, bindingVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, bindingVisibility);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    Injector.prototype._getByKeyHost = function (key, optional, bindingVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            if (inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            if (lang_1.isPresent(inj._parent) && inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    };
    Injector.prototype._getPrivateDependency = function (key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    Injector.prototype._getByKeyDefault = function (key, optional, bindingVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            bindingVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, bindingVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            bindingVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    };
    Object.defineProperty(Injector.prototype, "displayName", {
        get: function () {
            return "Injector(bindings: [" + _mapBindings(this, function (b) { return (" \"" + b.key.displayName + "\" "); }).join(", ") + "])";
        },
        enumerable: true,
        configurable: true
    });
    Injector.prototype.toString = function () { return this.displayName; };
    return Injector;
})();
exports.Injector = Injector;
var INJECTOR_KEY = key_1.Key.get(Injector);
function _mapBindings(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfBindings; ++i) {
        res.push(fn(injector._proto.getBindingAtIndex(i)));
    }
    return res;
}

},{"./binding":27,"./exceptions":29,"./key":32,"./metadata":33,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],32:[function(require,module,exports){
'use strict';var collection_1 = require('angular2/src/core/facade/collection');
var lang_1 = require('angular2/src/core/facade/lang');
var type_literal_1 = require('./type_literal');
var forward_ref_1 = require('./forward_ref');
var type_literal_2 = require('./type_literal');
exports.TypeLiteral = type_literal_2.TypeLiteral;
/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`, usually the `Type` of the instance.
 *
 * Keys are used internally by the {@link Injector} because their system-wide unique `id`s allow the
 * injector to index in arrays rather than looking up items in maps.
 */
var Key = (function () {
    function Key(token, id) {
        this.token = token;
        this.id = id;
        if (lang_1.isBlank(token)) {
            throw new lang_1.BaseException('Token must be defined!');
        }
    }
    Object.defineProperty(Key.prototype, "displayName", {
        get: function () { return lang_1.stringify(this.token); },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves a `Key` for a token.
     */
    Key.get = function (token) { return _globalKeyRegistry.get(forward_ref_1.resolveForwardRef(token)); };
    Object.defineProperty(Key, "numberOfKeys", {
        /**
         * @returns the number of keys registered in the system.
         */
        get: function () { return _globalKeyRegistry.numberOfKeys; },
        enumerable: true,
        configurable: true
    });
    return Key;
})();
exports.Key = Key;
/**
 * @private
 */
var KeyRegistry = (function () {
    function KeyRegistry() {
        this._allKeys = new Map();
    }
    KeyRegistry.prototype.get = function (token) {
        if (token instanceof Key)
            return token;
        // TODO: workaround for https://github.com/Microsoft/TypeScript/issues/3123
        var theToken = token;
        if (token instanceof type_literal_1.TypeLiteral) {
            theToken = token.type;
        }
        token = theToken;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new Key(token, Key.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    };
    Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
        get: function () { return collection_1.MapWrapper.size(this._allKeys); },
        enumerable: true,
        configurable: true
    });
    return KeyRegistry;
})();
exports.KeyRegistry = KeyRegistry;
var _globalKeyRegistry = new KeyRegistry();

},{"./forward_ref":30,"./type_literal":35,"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],33:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require("angular2/src/core/facade/lang");
/**
 * A parameter metadata that specifies a dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@Inject(MyService) aService:MyService) {}
 * }
 * ```
 */
var InjectMetadata = (function () {
    function InjectMetadata(token) {
        this.token = token;
    }
    InjectMetadata.prototype.toString = function () { return "@Inject(" + lang_1.stringify(this.token) + ")"; };
    InjectMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], InjectMetadata);
    return InjectMetadata;
})();
exports.InjectMetadata = InjectMetadata;
/**
 * A parameter metadata that marks a dependency as optional. {@link Injector} provides `null` if
 * the dependency is not found.
 *
 * ```
 * class AComponent {
 *   constructor(@Optional() aService:MyService) {
 *     this.aService = aService;
 *   }
 * }
 * ```
 */
var OptionalMetadata = (function () {
    function OptionalMetadata() {
    }
    OptionalMetadata.prototype.toString = function () { return "@Optional()"; };
    OptionalMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], OptionalMetadata);
    return OptionalMetadata;
})();
exports.OptionalMetadata = OptionalMetadata;
/**
 * `DependencyMetadata is used by the framework to extend DI.
 *
 * Only metadata implementing `DependencyMetadata` are added to the list of dependency
 * properties.
 *
 * For example:
 *
 * ```
 * class Exclude extends DependencyMetadata {}
 * class NotDependencyProperty {}
 *
 * class AComponent {
 *   constructor(@Exclude @NotDependencyProperty aService:AService) {}
 * }
 * ```
 *
 * will create the following dependency:
 *
 * ```
 * new Dependency(Key.get(AService), [new Exclude()])
 * ```
 *
 * The framework can use `new Exclude()` to handle the `aService` dependency
 * in a specific way.
 */
var DependencyMetadata = (function () {
    function DependencyMetadata() {
    }
    Object.defineProperty(DependencyMetadata.prototype, "token", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    DependencyMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], DependencyMetadata);
    return DependencyMetadata;
})();
exports.DependencyMetadata = DependencyMetadata;
/**
 * A marker metadata that marks a class as available to `Injector` for creation. Used by tooling
 * for generating constructor stubs.
 *
 * ```
 * class NeedsService {
 *   constructor(svc:UsefulService) {}
 * }
 *
 * @Injectable
 * class UsefulService {}
 * ```
 */
var InjectableMetadata = (function () {
    function InjectableMetadata() {
    }
    InjectableMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], InjectableMetadata);
    return InjectableMetadata;
})();
exports.InjectableMetadata = InjectableMetadata;
/**
 * Specifies that an injector should retrieve a dependency from itself.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Self() dependency:Dependency) {}
 * }
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * var nd = inj.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(Dependency);
 * ```
 */
var SelfMetadata = (function () {
    function SelfMetadata() {
    }
    SelfMetadata.prototype.toString = function () { return "@Self()"; };
    SelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SelfMetadata);
    return SelfMetadata;
})();
exports.SelfMetadata = SelfMetadata;
/**
 * Specifies that the dependency resolution should start from the parent injector.
 *
 * ## Example
 *
 *
 * ```
 * class Service {}
 *
 * class ParentService implements Service {
 * }
 *
 * class ChildService implements Service {
 *   constructor(public @SkipSelf() parentService:Service) {}
 * }
 *
 * var parent = Injector.resolveAndCreate([
 *   bind(Service).toClass(ParentService)
 * ]);
 * var child = parent.resolveAndCreateChild([
 *   bind(Service).toClass(ChildSerice)
 * ]);
 * var s = child.get(Service);
 * expect(s).toBeAnInstanceOf(ChildService);
 * expect(s.parentService).toBeAnInstanceOf(ParentService);
 * ```
 */
var SkipSelfMetadata = (function () {
    function SkipSelfMetadata() {
    }
    SkipSelfMetadata.prototype.toString = function () { return "@SkipSelf()"; };
    SkipSelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SkipSelfMetadata);
    return SkipSelfMetadata;
})();
exports.SkipSelfMetadata = SkipSelfMetadata;
/**
 * Specifies that an injector should retrieve a dependency from any injector until reaching the
 * closest host.
 *
 * ## Example
 *
 * ```
 * class Dependency {
 * }
 *
 * class NeedsDependency {
 *   constructor(public @Host() dependency:Dependency) {}
 * }
 *
 * var parent = Injector.resolveAndCreate([
 *   bind(Dependency).toClass(HostDependency)
 * ]);
 * var child = parent.resolveAndCreateChild([]);
 * var grandChild = child.resolveAndCreateChild([NeedsDependency, Depedency]);
 * var nd = grandChild.get(NeedsDependency);
 * expect(nd.dependency).toBeAnInstanceOf(HostDependency);
 * ```
 */
var HostMetadata = (function () {
    function HostMetadata() {
    }
    HostMetadata.prototype.toString = function () { return "@Host()"; };
    HostMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], HostMetadata);
    return HostMetadata;
})();
exports.HostMetadata = HostMetadata;

},{"angular2/src/core/facade/lang":38}],34:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/core/facade/lang');
var OpaqueToken = (function () {
    function OpaqueToken(desc) {
        this._desc = 'Token(' + desc + ')';
    }
    OpaqueToken.prototype.toString = function () { return this._desc; };
    OpaqueToken = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], OpaqueToken);
    return OpaqueToken;
})();
exports.OpaqueToken = OpaqueToken;

},{"angular2/src/core/facade/lang":38}],35:[function(require,module,exports){
'use strict';/**
 * Type literals is a Dart-only feature. This is here only so we can x-compile
 * to multiple languages.
 */
var TypeLiteral = (function () {
    function TypeLiteral() {
    }
    Object.defineProperty(TypeLiteral.prototype, "type", {
        get: function () { throw new Error("Type literals are only supported in Dart"); },
        enumerable: true,
        configurable: true
    });
    return TypeLiteral;
})();
exports.TypeLiteral = TypeLiteral;

},{}],36:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../../typings/tsd.d.ts" />
var lang_1 = require('angular2/src/core/facade/lang');
var Rx = require('rx');
var PromiseWrapper = (function () {
    function PromiseWrapper() {
    }
    PromiseWrapper.resolve = function (obj) { return Promise.resolve(obj); };
    PromiseWrapper.reject = function (obj, _) { return Promise.reject(obj); };
    // Note: We can't rename this method into `catch`, as this is not a valid
    // method name in Dart.
    PromiseWrapper.catchError = function (promise, onError) {
        return promise.catch(onError);
    };
    PromiseWrapper.all = function (promises) {
        if (promises.length == 0)
            return Promise.resolve([]);
        return Promise.all(promises);
    };
    PromiseWrapper.then = function (promise, success, rejection) {
        return promise.then(success, rejection);
    };
    PromiseWrapper.wrap = function (computation) {
        return new Promise(function (res, rej) {
            try {
                res(computation());
            }
            catch (e) {
                rej(e);
            }
        });
    };
    PromiseWrapper.completer = function () {
        var resolve;
        var reject;
        var p = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        return { promise: p, resolve: resolve, reject: reject };
    };
    return PromiseWrapper;
})();
exports.PromiseWrapper = PromiseWrapper;
var TimerWrapper = (function () {
    function TimerWrapper() {
    }
    TimerWrapper.setTimeout = function (fn, millis) { return lang_1.global.setTimeout(fn, millis); };
    TimerWrapper.clearTimeout = function (id) { lang_1.global.clearTimeout(id); };
    TimerWrapper.setInterval = function (fn, millis) {
        return lang_1.global.setInterval(fn, millis);
    };
    TimerWrapper.clearInterval = function (id) { lang_1.global.clearInterval(id); };
    return TimerWrapper;
})();
exports.TimerWrapper = TimerWrapper;
var ObservableWrapper = (function () {
    function ObservableWrapper() {
    }
    // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
    ObservableWrapper.subscribe = function (emitter, onNext, onThrow, onReturn) {
        if (onThrow === void 0) { onThrow = null; }
        if (onReturn === void 0) { onReturn = null; }
        return emitter.observer({ next: onNext, throw: onThrow, return: onReturn });
    };
    ObservableWrapper.isObservable = function (obs) { return obs instanceof Observable; };
    ObservableWrapper.dispose = function (subscription) { subscription.dispose(); };
    ObservableWrapper.callNext = function (emitter, value) { emitter.next(value); };
    ObservableWrapper.callThrow = function (emitter, error) { emitter.throw(error); };
    ObservableWrapper.callReturn = function (emitter) { emitter.return(null); };
    return ObservableWrapper;
})();
exports.ObservableWrapper = ObservableWrapper;
// TODO: vsavkin change to interface
var Observable = (function () {
    function Observable() {
    }
    Observable.prototype.observer = function (generator) { return null; };
    return Observable;
})();
exports.Observable = Observable;
/**
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
var EventEmitter = (function (_super) {
    __extends(EventEmitter, _super);
    function EventEmitter() {
        _super.call(this);
        this._subject = new Rx.Subject();
        this._immediateScheduler = Rx.Scheduler.immediate;
    }
    EventEmitter.prototype.observer = function (generator) {
        return this._subject.observeOn(this._immediateScheduler)
            .subscribe(function (value) { setTimeout(function () { return generator.next(value); }); }, function (error) { return generator.throw ? generator.throw(error) : null; }, function () { return generator.return ? generator.return() : null; });
    };
    EventEmitter.prototype.toRx = function () { return this._subject; };
    EventEmitter.prototype.next = function (value) { this._subject.onNext(value); };
    EventEmitter.prototype.throw = function (error) { this._subject.onError(error); };
    EventEmitter.prototype.return = function (value) { this._subject.onCompleted(); };
    return EventEmitter;
})(Observable);
exports.EventEmitter = EventEmitter;

},{"angular2/src/core/facade/lang":38,"rx":44}],37:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
exports.Map = lang_1.global.Map;
exports.Set = lang_1.global.Set;
exports.StringMap = lang_1.global.Object;
// Safari and Internet Explorer do not support the iterable parameter to the
// Map constructor.  We work around that by manually adding the items.
var createMapFromPairs = (function () {
    try {
        if (new exports.Map([[1, 2]]).size === 1) {
            return function createMapFromPairs(pairs) { return new exports.Map(pairs); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromPairs(pairs) {
        var map = new exports.Map();
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            map.set(pair[0], pair[1]);
        }
        return map;
    };
})();
var createMapFromMap = (function () {
    try {
        if (new exports.Map(new exports.Map())) {
            return function createMapFromMap(m) { return new exports.Map(m); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromMap(m) {
        var map = new exports.Map();
        m.forEach(function (v, k) { map.set(k, v); });
        return map;
    };
})();
var _clearValues = (function () {
    if ((new exports.Map()).keys().next) {
        return function _clearValues(m) {
            var keyIterator = m.keys();
            var k;
            while (!((k = keyIterator.next()).done)) {
                m.set(k.value, null);
            }
        };
    }
    else {
        return function _clearValuesWithForeEach(m) {
            m.forEach(function (v, k) { m.set(k, null); });
        };
    }
})();
// Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
// TODO(mlaval): remove the work around once we have a working polyfill of Array.from
var _arrayFromMap = (function () {
    try {
        if ((new exports.Map()).values().next) {
            return function createArrayFromMap(m, getValues) { return getValues ? Array.from(m.values()) : Array.from(m.keys()); };
        }
    }
    catch (e) {
    }
    return function createArrayFromMapWithForeach(m, getValues) {
        var res = ListWrapper.createFixedSize(m.size), i = 0;
        m.forEach(function (v, k) {
            res[i] = getValues ? v : k;
            i++;
        });
        return res;
    };
})();
var MapWrapper = (function () {
    function MapWrapper() {
    }
    MapWrapper.clone = function (m) { return createMapFromMap(m); };
    MapWrapper.createFromStringMap = function (stringMap) {
        var result = new exports.Map();
        for (var prop in stringMap) {
            result.set(prop, stringMap[prop]);
        }
        return result;
    };
    MapWrapper.toStringMap = function (m) {
        var r = {};
        m.forEach(function (v, k) { return r[k] = v; });
        return r;
    };
    MapWrapper.createFromPairs = function (pairs) { return createMapFromPairs(pairs); };
    MapWrapper.forEach = function (m, fn) { m.forEach(fn); };
    MapWrapper.get = function (map, key) { return map.get(key); };
    MapWrapper.size = function (m) { return m.size; };
    MapWrapper.delete = function (m, k) { m.delete(k); };
    MapWrapper.clearValues = function (m) { _clearValues(m); };
    MapWrapper.iterable = function (m) { return m; };
    MapWrapper.keys = function (m) { return _arrayFromMap(m, false); };
    MapWrapper.values = function (m) { return _arrayFromMap(m, true); };
    return MapWrapper;
})();
exports.MapWrapper = MapWrapper;
/**
 * Wraps Javascript Objects
 */
var StringMapWrapper = (function () {
    function StringMapWrapper() {
    }
    StringMapWrapper.create = function () {
        // Note: We are not using Object.create(null) here due to
        // performance!
        // http://jsperf.com/ng2-object-create-null
        return {};
    };
    StringMapWrapper.contains = function (map, key) {
        return map.hasOwnProperty(key);
    };
    StringMapWrapper.get = function (map, key) {
        return map.hasOwnProperty(key) ? map[key] : undefined;
    };
    StringMapWrapper.set = function (map, key, value) { map[key] = value; };
    StringMapWrapper.keys = function (map) { return Object.keys(map); };
    StringMapWrapper.isEmpty = function (map) {
        for (var prop in map) {
            return false;
        }
        return true;
    };
    StringMapWrapper.delete = function (map, key) { delete map[key]; };
    StringMapWrapper.forEach = function (map, callback) {
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
            }
        }
    };
    StringMapWrapper.merge = function (m1, m2) {
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
    };
    StringMapWrapper.equals = function (m1, m2) {
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
    };
    return StringMapWrapper;
})();
exports.StringMapWrapper = StringMapWrapper;
var ListWrapper = (function () {
    function ListWrapper() {
    }
    // JS has no way to express a staticly fixed size list, but dart does so we
    // keep both methods.
    ListWrapper.createFixedSize = function (size) { return new Array(size); };
    ListWrapper.createGrowableSize = function (size) { return new Array(size); };
    ListWrapper.clone = function (array) { return array.slice(0); };
    ListWrapper.map = function (array, fn) { return array.map(fn); };
    ListWrapper.forEach = function (array, fn) {
        for (var i = 0; i < array.length; i++) {
            fn(array[i]);
        }
    };
    ListWrapper.forEachWithIndex = function (array, fn) {
        for (var i = 0; i < array.length; i++) {
            fn(array[i], i);
        }
    };
    ListWrapper.first = function (array) {
        if (!array)
            return null;
        return array[0];
    };
    ListWrapper.last = function (array) {
        if (!array || array.length == 0)
            return null;
        return array[array.length - 1];
    };
    ListWrapper.find = function (list, pred) {
        for (var i = 0; i < list.length; ++i) {
            if (pred(list[i]))
                return list[i];
        }
        return null;
    };
    ListWrapper.indexOf = function (array, value, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        return array.indexOf(value, startIndex);
    };
    ListWrapper.reduce = function (list, fn, init) {
        return list.reduce(fn, init);
    };
    ListWrapper.filter = function (array, pred) { return array.filter(pred); };
    ListWrapper.any = function (list, pred) {
        for (var i = 0; i < list.length; ++i) {
            if (pred(list[i]))
                return true;
        }
        return false;
    };
    ListWrapper.contains = function (list, el) { return list.indexOf(el) !== -1; };
    ListWrapper.reversed = function (array) {
        var a = ListWrapper.clone(array);
        return a.reverse();
    };
    ListWrapper.concat = function (a, b) { return a.concat(b); };
    ListWrapper.insert = function (list, index, value) { list.splice(index, 0, value); };
    ListWrapper.removeAt = function (list, index) {
        var res = list[index];
        list.splice(index, 1);
        return res;
    };
    ListWrapper.removeAll = function (list, items) {
        for (var i = 0; i < items.length; ++i) {
            var index = list.indexOf(items[i]);
            list.splice(index, 1);
        }
    };
    ListWrapper.removeLast = function (list) { return list.pop(); };
    ListWrapper.remove = function (list, el) {
        var index = list.indexOf(el);
        if (index > -1) {
            list.splice(index, 1);
            return true;
        }
        return false;
    };
    ListWrapper.clear = function (list) { list.length = 0; };
    ListWrapper.join = function (list, s) { return list.join(s); };
    ListWrapper.isEmpty = function (list) { return list.length == 0; };
    ListWrapper.fill = function (list, value, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = null; }
        list.fill(value, start, end === null ? list.length : end);
    };
    ListWrapper.equals = function (a, b) {
        if (a.length != b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    };
    ListWrapper.slice = function (l, from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = null; }
        return l.slice(from, to === null ? undefined : to);
    };
    ListWrapper.splice = function (l, from, length) { return l.splice(from, length); };
    ListWrapper.sort = function (l, compareFn) {
        if (lang_1.isPresent(compareFn)) {
            l.sort(compareFn);
        }
        else {
            l.sort();
        }
    };
    ListWrapper.toString = function (l) { return l.toString(); };
    ListWrapper.toJSON = function (l) { return JSON.stringify(l); };
    ListWrapper.maximum = function (list, predicate) {
        if (list.length == 0) {
            return null;
        }
        var solution = null;
        var maxValue = -Infinity;
        for (var index = 0; index < list.length; index++) {
            var candidate = list[index];
            if (lang_1.isBlank(candidate)) {
                continue;
            }
            var candidateValue = predicate(candidate);
            if (candidateValue > maxValue) {
                solution = candidate;
                maxValue = candidateValue;
            }
        }
        return solution;
    };
    return ListWrapper;
})();
exports.ListWrapper = ListWrapper;
function isListLikeIterable(obj) {
    if (!lang_1.isJsObject(obj))
        return false;
    return lang_1.isArray(obj) ||
        (!(obj instanceof exports.Map) &&
            Symbol.iterator in obj); // JS Iterable have a Symbol.iterator prop
}
exports.isListLikeIterable = isListLikeIterable;
function iterateListLike(obj, fn) {
    if (lang_1.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            fn(obj[i]);
        }
    }
    else {
        var iterator = obj[Symbol.iterator]();
        var item;
        while (!((item = iterator.next()).done)) {
            fn(item.value);
        }
    }
}
exports.iterateListLike = iterateListLike;
// Safari and Internet Explorer do not support the iterable parameter to the
// Set constructor.  We work around that by manually adding the items.
var createSetFromList = (function () {
    var test = new exports.Set([1, 2, 3]);
    if (test.size === 3) {
        return function createSetFromList(lst) { return new exports.Set(lst); };
    }
    else {
        return function createSetAndPopulateFromList(lst) {
            var res = new exports.Set(lst);
            if (res.size !== lst.length) {
                for (var i = 0; i < lst.length; i++) {
                    res.add(lst[i]);
                }
            }
            return res;
        };
    }
})();
var SetWrapper = (function () {
    function SetWrapper() {
    }
    SetWrapper.createFromList = function (lst) { return createSetFromList(lst); };
    SetWrapper.has = function (s, key) { return s.has(key); };
    SetWrapper.delete = function (m, k) { m.delete(k); };
    return SetWrapper;
})();
exports.SetWrapper = SetWrapper;

},{"angular2/src/core/facade/lang":38}],38:[function(require,module,exports){
'use strict';/// <reference path="../../../manual_typings/globals.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var globalScope;
if (typeof window === 'undefined') {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
        globalScope = self;
    }
    else {
        globalScope = global;
    }
}
else {
    globalScope = window;
}
;
// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global = globalScope;
exports.global = _global;
exports.Type = Function;
function getTypeNameForDebugging(type) {
    return type['name'];
}
exports.getTypeNameForDebugging = getTypeNameForDebugging;
var BaseException = (function (_super) {
    __extends(BaseException, _super);
    function BaseException(message, _originalException, _originalStack, _context) {
        _super.call(this, message);
        this.message = message;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this.stack = (new Error(message)).stack;
    }
    Object.defineProperty(BaseException.prototype, "originalException", {
        get: function () { return this._originalException; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseException.prototype, "originalStack", {
        get: function () { return this._originalStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseException.prototype, "context", {
        get: function () { return this._context; },
        enumerable: true,
        configurable: true
    });
    BaseException.prototype.toString = function () { return this.message; };
    return BaseException;
})(Error);
exports.BaseException = BaseException;
function makeTypeError(message) {
    return new TypeError(message);
}
exports.makeTypeError = makeTypeError;
exports.Math = _global.Math;
exports.Date = _global.Date;
var assertionsEnabled_ = typeof _global['assert'] !== 'undefined';
function assertionsEnabled() {
    return assertionsEnabled_;
}
exports.assertionsEnabled = assertionsEnabled;
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    if (assertionsEnabled_) {
        _global['assert'].call(condition);
    }
};
// This function is needed only to properly support Dart's const expressions
// see https://github.com/angular/ts2dart/pull/151 for more info
function CONST_EXPR(expr) {
    return expr;
}
exports.CONST_EXPR = CONST_EXPR;
function CONST() {
    return function (target) { return target; };
}
exports.CONST = CONST;
function ABSTRACT() {
    return function (t) { return t; };
}
exports.ABSTRACT = ABSTRACT;
function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
exports.isPresent = isPresent;
function isBlank(obj) {
    return obj === undefined || obj === null;
}
exports.isBlank = isBlank;
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
function isFunction(obj) {
    return typeof obj === "function";
}
exports.isFunction = isFunction;
function isType(obj) {
    return isFunction(obj);
}
exports.isType = isType;
function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
exports.isStringMap = isStringMap;
function isPromise(obj) {
    return obj instanceof _global.Promise;
}
exports.isPromise = isPromise;
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;
function isNumber(obj) {
    return typeof obj === 'number';
}
exports.isNumber = isNumber;
function isDate(obj) {
    return obj instanceof exports.Date && !isNaN(obj.valueOf());
}
exports.isDate = isDate;
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
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
exports.stringify = stringify;
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
function serializeEnum(val) {
    return val;
}
exports.serializeEnum = serializeEnum;
function deserializeEnum(val, values) {
    return val;
}
exports.deserializeEnum = deserializeEnum;
var StringWrapper = (function () {
    function StringWrapper() {
    }
    StringWrapper.fromCharCode = function (code) { return String.fromCharCode(code); };
    StringWrapper.charCodeAt = function (s, index) { return s.charCodeAt(index); };
    StringWrapper.split = function (s, regExp) { return s.split(regExp); };
    StringWrapper.equals = function (s, s2) { return s === s2; };
    StringWrapper.replace = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.replaceAll = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.toUpperCase = function (s) { return s.toUpperCase(); };
    StringWrapper.toLowerCase = function (s) { return s.toLowerCase(); };
    StringWrapper.startsWith = function (s, start) { return s.startsWith(start); };
    StringWrapper.substring = function (s, start, end) {
        if (end === void 0) { end = null; }
        return s.substring(start, end === null ? undefined : end);
    };
    StringWrapper.replaceAllMapped = function (s, from, cb) {
        return s.replace(from, function () {
            var matches = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                matches[_i - 0] = arguments[_i];
            }
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    };
    StringWrapper.contains = function (s, substr) { return s.indexOf(substr) != -1; };
    StringWrapper.compare = function (a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return StringWrapper;
})();
exports.StringWrapper = StringWrapper;
var StringJoiner = (function () {
    function StringJoiner(parts) {
        if (parts === void 0) { parts = []; }
        this.parts = parts;
    }
    StringJoiner.prototype.add = function (part) { this.parts.push(part); };
    StringJoiner.prototype.toString = function () { return this.parts.join(""); };
    return StringJoiner;
})();
exports.StringJoiner = StringJoiner;
var NumberParseError = (function (_super) {
    __extends(NumberParseError, _super);
    function NumberParseError(message) {
        _super.call(this);
        this.message = message;
    }
    NumberParseError.prototype.toString = function () { return this.message; };
    return NumberParseError;
})(BaseException);
exports.NumberParseError = NumberParseError;
var NumberWrapper = (function () {
    function NumberWrapper() {
    }
    NumberWrapper.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
    NumberWrapper.equal = function (a, b) { return a === b; };
    NumberWrapper.parseIntAutoRadix = function (text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    };
    NumberWrapper.parseInt = function (text, radix) {
        if (radix == 10) {
            if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else if (radix == 16) {
            if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else {
            var result = parseInt(text, radix);
            if (!isNaN(result)) {
                return result;
            }
        }
        throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
            radix);
    };
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    NumberWrapper.parseFloat = function (text) { return parseFloat(text); };
    Object.defineProperty(NumberWrapper, "NaN", {
        get: function () { return NaN; },
        enumerable: true,
        configurable: true
    });
    NumberWrapper.isNaN = function (value) { return isNaN(value); };
    NumberWrapper.isInteger = function (value) { return Number.isInteger(value); };
    return NumberWrapper;
})();
exports.NumberWrapper = NumberWrapper;
exports.RegExp = _global.RegExp;
var RegExpWrapper = (function () {
    function RegExpWrapper() {
    }
    RegExpWrapper.create = function (regExpStr, flags) {
        if (flags === void 0) { flags = ''; }
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    };
    RegExpWrapper.firstMatch = function (regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    };
    RegExpWrapper.test = function (regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    };
    RegExpWrapper.matcher = function (regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    };
    return RegExpWrapper;
})();
exports.RegExpWrapper = RegExpWrapper;
var RegExpMatcherWrapper = (function () {
    function RegExpMatcherWrapper() {
    }
    RegExpMatcherWrapper.next = function (matcher) {
        return matcher.re.exec(matcher.input);
    };
    return RegExpMatcherWrapper;
})();
exports.RegExpMatcherWrapper = RegExpMatcherWrapper;
var FunctionWrapper = (function () {
    function FunctionWrapper() {
    }
    FunctionWrapper.apply = function (fn, posArgs) { return fn.apply(null, posArgs); };
    return FunctionWrapper;
})();
exports.FunctionWrapper = FunctionWrapper;
// JS has NaN !== NaN
function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
exports.looseIdentical = looseIdentical;
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
function getMapKey(value) {
    return value;
}
exports.getMapKey = getMapKey;
function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
exports.normalizeBlank = normalizeBlank;
function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
exports.normalizeBool = normalizeBool;
function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
exports.isJsObject = isJsObject;
function print(obj) {
    if (obj instanceof BaseException) {
        console.log(obj.stack);
    }
    else {
        console.log(obj);
    }
}
exports.print = print;
// Can't be all uppercase as our transpiler would think it is a special directive...
var Json = (function () {
    function Json() {
    }
    Json.parse = function (s) { return _global.JSON.parse(s); };
    Json.stringify = function (data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    };
    return Json;
})();
exports.Json = Json;
var DateWrapper = (function () {
    function DateWrapper() {
    }
    DateWrapper.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minutes === void 0) { minutes = 0; }
        if (seconds === void 0) { seconds = 0; }
        if (milliseconds === void 0) { milliseconds = 0; }
        return new exports.Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    };
    DateWrapper.fromMillis = function (ms) { return new exports.Date(ms); };
    DateWrapper.toMillis = function (date) { return date.getTime(); };
    DateWrapper.now = function () { return new exports.Date(); };
    DateWrapper.toJson = function (date) { return date.toJSON(); };
    return DateWrapper;
})();
exports.DateWrapper = DateWrapper;
function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
        var name = parts.shift();
        if (obj.hasOwnProperty(name)) {
            obj = obj[name];
        }
        else {
            obj = obj[name] = {};
        }
    }
    obj[parts.shift()] = value;
}
exports.setValueOnPath = setValueOnPath;

},{}],39:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
exports.Math = lang_1.global.Math;
exports.NaN = typeof exports.NaN;

},{"angular2/src/core/facade/lang":38}],40:[function(require,module,exports){
'use strict';var reflector_1 = require('./reflector');
var reflector_2 = require('./reflector');
exports.Reflector = reflector_2.Reflector;
exports.ReflectionInfo = reflector_2.ReflectionInfo;
var reflection_capabilities_1 = require('./reflection_capabilities');
exports.reflector = new reflector_1.Reflector(new reflection_capabilities_1.ReflectionCapabilities());

},{"./reflection_capabilities":41,"./reflector":42}],41:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var ReflectionCapabilities = (function () {
    function ReflectionCapabilities(reflect) {
        this._reflect = lang_1.isPresent(reflect) ? reflect : lang_1.global.Reflect;
    }
    ReflectionCapabilities.prototype.isReflectionEnabled = function () { return true; };
    ReflectionCapabilities.prototype.factory = function (t) {
        switch (t.length) {
            case 0:
                return function () { return new t(); };
            case 1:
                return function (a1) { return new t(a1); };
            case 2:
                return function (a1, a2) { return new t(a1, a2); };
            case 3:
                return function (a1, a2, a3) { return new t(a1, a2, a3); };
            case 4:
                return function (a1, a2, a3, a4) { return new t(a1, a2, a3, a4); };
            case 5:
                return function (a1, a2, a3, a4, a5) { return new t(a1, a2, a3, a4, a5); };
            case 6:
                return function (a1, a2, a3, a4, a5, a6) { return new t(a1, a2, a3, a4, a5, a6); };
            case 7:
                return function (a1, a2, a3, a4, a5, a6, a7) { return new t(a1, a2, a3, a4, a5, a6, a7); };
            case 8:
                return function (a1, a2, a3, a4, a5, a6, a7, a8) { return new t(a1, a2, a3, a4, a5, a6, a7, a8); };
            case 9:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9) { return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9); };
            case 10:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                };
            case 11:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
                };
            case 12:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
                };
            case 13:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
                };
            case 14:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
                };
            case 15:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
                };
            case 16:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
                };
            case 17:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
                };
            case 18:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
                };
            case 19:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
                };
            case 20:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
                };
        }
        ;
        throw new Error("Cannot create a factory for '" + lang_1.stringify(t) + "' because its constructor has more than 20 arguments");
    };
    ReflectionCapabilities.prototype._zipTypesAndAnnotaions = function (paramTypes, paramAnnotations) {
        var result;
        if (typeof paramTypes === 'undefined') {
            result = collection_1.ListWrapper.createFixedSize(paramAnnotations.length);
        }
        else {
            result = collection_1.ListWrapper.createFixedSize(paramTypes.length);
        }
        for (var i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            }
            else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            }
            else {
                result[i] = [];
            }
            if (lang_1.isPresent(paramAnnotations) && lang_1.isPresent(paramAnnotations[i])) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    };
    ReflectionCapabilities.prototype.parameters = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.parameters)) {
            return typeOrFunc.parameters;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var paramAnnotations = this._reflect.getMetadata('parameters', typeOrFunc);
            var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOrFunc);
            if (lang_1.isPresent(paramTypes) || lang_1.isPresent(paramAnnotations)) {
                return this._zipTypesAndAnnotaions(paramTypes, paramAnnotations);
            }
        }
        return collection_1.ListWrapper.createFixedSize(typeOrFunc.length);
    };
    ReflectionCapabilities.prototype.annotations = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.annotations)) {
            var annotations = typeOrFunc.annotations;
            if (lang_1.isFunction(annotations) && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var annotations = this._reflect.getMetadata('annotations', typeOrFunc);
            if (lang_1.isPresent(annotations))
                return annotations;
        }
        return [];
    };
    ReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.propMetadata)) {
            var propMetadata = typeOrFunc.propMetadata;
            if (lang_1.isFunction(propMetadata) && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
            if (lang_1.isPresent(propMetadata))
                return propMetadata;
        }
        return {};
    };
    ReflectionCapabilities.prototype.interfaces = function (type) {
        throw new lang_1.BaseException("JavaScript does not support interfaces");
    };
    ReflectionCapabilities.prototype.getter = function (name) { return new Function('o', 'return o.' + name + ';'); };
    ReflectionCapabilities.prototype.setter = function (name) {
        return new Function('o', 'v', 'return o.' + name + ' = v;');
    };
    ReflectionCapabilities.prototype.method = function (name) {
        var functionBody = "if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);";
        return new Function('o', 'args', functionBody);
    };
    // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
    ReflectionCapabilities.prototype.importUri = function (type) { return './'; };
    return ReflectionCapabilities;
})();
exports.ReflectionCapabilities = ReflectionCapabilities;

},{"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],42:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
var collection_1 = require('angular2/src/core/facade/collection');
var ReflectionInfo = (function () {
    function ReflectionInfo(annotations, parameters, factory, interfaces, propMetadata) {
        this.annotations = annotations;
        this.parameters = parameters;
        this.factory = factory;
        this.interfaces = interfaces;
        this.propMetadata = propMetadata;
    }
    return ReflectionInfo;
})();
exports.ReflectionInfo = ReflectionInfo;
var Reflector = (function () {
    function Reflector(reflectionCapabilities) {
        this._injectableInfo = new collection_1.Map();
        this._getters = new collection_1.Map();
        this._setters = new collection_1.Map();
        this._methods = new collection_1.Map();
        this._usedKeys = null;
        this.reflectionCapabilities = reflectionCapabilities;
    }
    Reflector.prototype.isReflectionEnabled = function () { return this.reflectionCapabilities.isReflectionEnabled(); };
    /**
     * Causes `this` reflector to track keys used to access
     * {@link ReflectionInfo} objects.
     */
    Reflector.prototype.trackUsage = function () { this._usedKeys = new collection_1.Set(); };
    /**
     * Lists types for which reflection information was not requested since
     * {@link #trackUsage} was called. This list could later be audited as
     * potential dead code.
     */
    Reflector.prototype.listUnusedKeys = function () {
        var _this = this;
        if (this._usedKeys == null) {
            throw new lang_1.BaseException('Usage tracking is disabled');
        }
        var allTypes = collection_1.MapWrapper.keys(this._injectableInfo);
        return collection_1.ListWrapper.filter(allTypes, function (key) { return !collection_1.SetWrapper.has(_this._usedKeys, key); });
    };
    Reflector.prototype.registerFunction = function (func, funcInfo) {
        this._injectableInfo.set(func, funcInfo);
    };
    Reflector.prototype.registerType = function (type, typeInfo) {
        this._injectableInfo.set(type, typeInfo);
    };
    Reflector.prototype.registerGetters = function (getters) {
        _mergeMaps(this._getters, getters);
    };
    Reflector.prototype.registerSetters = function (setters) {
        _mergeMaps(this._setters, setters);
    };
    Reflector.prototype.registerMethods = function (methods) {
        _mergeMaps(this._methods, methods);
    };
    Reflector.prototype.factory = function (type) {
        if (this._containsReflectionInfo(type)) {
            var res = this._getReflectionInfo(type).factory;
            return lang_1.isPresent(res) ? res : null;
        }
        else {
            return this.reflectionCapabilities.factory(type);
        }
    };
    Reflector.prototype.parameters = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).parameters;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
    };
    Reflector.prototype.annotations = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).annotations;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
    };
    Reflector.prototype.propMetadata = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).propMetadata;
            return lang_1.isPresent(res) ? res : {};
        }
        else {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        }
    };
    Reflector.prototype.interfaces = function (type) {
        if (this._injectableInfo.has(type)) {
            var res = this._getReflectionInfo(type).interfaces;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.interfaces(type);
        }
    };
    Reflector.prototype.getter = function (name) {
        if (this._getters.has(name)) {
            return this._getters.get(name);
        }
        else {
            return this.reflectionCapabilities.getter(name);
        }
    };
    Reflector.prototype.setter = function (name) {
        if (this._setters.has(name)) {
            return this._setters.get(name);
        }
        else {
            return this.reflectionCapabilities.setter(name);
        }
    };
    Reflector.prototype.method = function (name) {
        if (this._methods.has(name)) {
            return this._methods.get(name);
        }
        else {
            return this.reflectionCapabilities.method(name);
        }
    };
    Reflector.prototype._getReflectionInfo = function (typeOrFunc) {
        if (lang_1.isPresent(this._usedKeys)) {
            this._usedKeys.add(typeOrFunc);
        }
        return this._injectableInfo.get(typeOrFunc);
    };
    Reflector.prototype._containsReflectionInfo = function (typeOrFunc) { return this._injectableInfo.has(typeOrFunc); };
    Reflector.prototype.importUri = function (type) { return this.reflectionCapabilities.importUri(type); };
    return Reflector;
})();
exports.Reflector = Reflector;
function _mergeMaps(target, config) {
    collection_1.StringMapWrapper.forEach(config, function (v, k) { return target.set(k, v); });
}

},{"angular2/src/core/facade/collection":37,"angular2/src/core/facade/lang":38}],43:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/core/facade/lang');
function extractAnnotation(annotation) {
    if (lang_1.isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
        // it is a decorator, extract annotation
        annotation = annotation.annotation;
    }
    return annotation;
}
function applyParams(fnOrArray, key) {
    if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
        fnOrArray === Number || fnOrArray === Array) {
        throw new Error("Can not use native " + lang_1.stringify(fnOrArray) + " as constructor");
    }
    if (lang_1.isFunction(fnOrArray)) {
        return fnOrArray;
    }
    else if (fnOrArray instanceof Array) {
        var annotations = fnOrArray;
        var fn = fnOrArray[fnOrArray.length - 1];
        if (!lang_1.isFunction(fn)) {
            throw new Error("Last position of Class method array must be Function in key " + key + " was '" + lang_1.stringify(fn) + "'");
        }
        var annoLength = annotations.length - 1;
        if (annoLength != fn.length) {
            throw new Error("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + lang_1.stringify(fn));
        }
        var paramsAnnotations = [];
        for (var i = 0, ii = annotations.length - 1; i < ii; i++) {
            var paramAnnotations = [];
            paramsAnnotations.push(paramAnnotations);
            var annotation = annotations[i];
            if (annotation instanceof Array) {
                for (var j = 0; j < annotation.length; j++) {
                    paramAnnotations.push(extractAnnotation(annotation[j]));
                }
            }
            else if (lang_1.isFunction(annotation)) {
                paramAnnotations.push(extractAnnotation(annotation));
            }
            else {
                paramAnnotations.push(annotation);
            }
        }
        Reflect.defineMetadata('parameters', paramsAnnotations, fn);
        return fn;
    }
    else {
        throw new Error("Only Function or Array is supported in Class definition for key '" + key + "' is '" + lang_1.stringify(fnOrArray) + "'");
    }
}
/**
 * Provides a way for expressing ES6 classes with parameter annotations in ES5.
 *
 * ## Basic Example
 *
 * ```
 * var Greeter = ng.Class({
 *   constructor: function(name) {
 *     this.name = name;
 *   },
 *
 *   greet: function() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class Greeter {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   greet() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * }
 * ```
 *
 * or equivalent to ES5:
 *
 * ```
 * var Greeter = function (name) {
 *   this.name = name;
 * }
 *
 * Greeter.prototype.greet = function () {
 *   alert('Hello ' + this.name + '!');
 * }
 * ```
 *
 * ## Example with parameter annotations
 *
 * ```
 * var MyService = ng.Class({
 *   constructor: [String, [new Query(), QueryList], function(name, queryList) {
 *     ...
 *   }]
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class MyService {
 *   constructor(name: string, @Query() queryList: QueryList) {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example with inheritance
 *
 * ```
 * var Shape = ng.Class({
 *   constructor: (color) {
 *     this.color = color;
 *   }
 * });
 *
 * var Square = ng.Class({
 *   extends: Shape,
 *   constructor: function(color, size) {
 *     Shape.call(this, color);
 *     this.size = size;
 *   }
 * });
 * ```
 */
function Class(clsDef) {
    var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
    var proto = constructor.prototype;
    if (clsDef.hasOwnProperty('extends')) {
        if (lang_1.isFunction(clsDef.extends)) {
            constructor.prototype = proto =
                Object.create(clsDef.extends.prototype);
        }
        else {
            throw new Error("Class definition 'extends' property must be a constructor function was: " + lang_1.stringify(clsDef.extends));
        }
    }
    for (var key in clsDef) {
        if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
            proto[key] = applyParams(clsDef[key], key);
        }
    }
    if (this && this.annotations instanceof Array) {
        Reflect.defineMetadata('annotations', this.annotations, constructor);
    }
    return constructor;
}
exports.Class = Class;
var Reflect = lang_1.global.Reflect;
if (!(Reflect && Reflect.getMetadata)) {
    throw 'reflect-metadata shim is required when using class decorators';
}
function makeDecorator(annotationCls, chainFn) {
    if (chainFn === void 0) { chainFn = null; }
    function DecoratorFactory(objOrType) {
        var annotationInstance = new annotationCls(objOrType);
        if (this instanceof annotationCls) {
            return annotationInstance;
        }
        else {
            var chainAnnotation = lang_1.isFunction(this) && this.annotations instanceof Array ? this.annotations : [];
            chainAnnotation.push(annotationInstance);
            var TypeDecorator = function TypeDecorator(cls) {
                var annotations = Reflect.getOwnMetadata('annotations', cls);
                annotations = annotations || [];
                annotations.push(annotationInstance);
                Reflect.defineMetadata('annotations', annotations, cls);
                return cls;
            };
            TypeDecorator.annotations = chainAnnotation;
            TypeDecorator.Class = Class;
            if (chainFn)
                chainFn(TypeDecorator);
            return TypeDecorator;
        }
    }
    DecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return DecoratorFactory;
}
exports.makeDecorator = makeDecorator;
function makeParamDecorator(annotationCls) {
    function ParamDecoratorFactory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var annotationInstance = Object.create(annotationCls.prototype);
        annotationCls.apply(annotationInstance, args);
        if (this instanceof annotationCls) {
            return annotationInstance;
        }
        else {
            ParamDecorator.annotation = annotationInstance;
            return ParamDecorator;
        }
        function ParamDecorator(cls, unusedKey, index) {
            var parameters = Reflect.getMetadata('parameters', cls);
            parameters = parameters || [];
            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }
            parameters[index] = parameters[index] || [];
            var annotationsForParam = parameters[index];
            annotationsForParam.push(annotationInstance);
            Reflect.defineMetadata('parameters', parameters, cls);
            return cls;
        }
    }
    ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return ParamDecoratorFactory;
}
exports.makeParamDecorator = makeParamDecorator;
function makePropDecorator(decoratorCls) {
    function PropDecoratorFactory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var decoratorInstance = Object.create(decoratorCls.prototype);
        decoratorCls.apply(decoratorInstance, args);
        if (this instanceof decoratorCls) {
            return decoratorInstance;
        }
        else {
            return function PropDecorator(target, name) {
                var meta = Reflect.getOwnMetadata('propMetadata', target.constructor);
                meta = meta || {};
                meta[name] = meta[name] || [];
                meta[name].unshift(decoratorInstance);
                Reflect.defineMetadata('propMetadata', meta, target.constructor);
            };
        }
    }
    PropDecoratorFactory.prototype = Object.create(decoratorCls.prototype);
    return PropDecoratorFactory;
}
exports.makePropDecorator = makePropDecorator;

},{"angular2/src/core/facade/lang":38}],44:[function(require,module,exports){

},{}]},{},[3]);
module.exports = global.__benchpressExports;
