/// <reference path="node_modules/zone.js/dist/zone.js.d.ts" />

// Polyfills
import 'reflect-metadata';
import 'core-js';
// import 'zone.js';
// ng2 beta-10 issue with zone.js
// track https://github.com/angular/angular/issues/7660

// Angular 2
import 'angular2/platform/browser';
import 'angular2/platform/common_dom';
import 'angular2/core';
import 'angular2/common';
import 'angular2/router';
import 'angular2/http';

// RxJS
import 'rxjs';

// Others
import 'json-formatter-js';
