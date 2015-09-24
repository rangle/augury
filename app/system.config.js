/* global System */
System.defaultJSExtensions = true;
System.paths['immutable'] = '../node_modules/immutable/dist/immutable.js';
//System.paths['angular2/*'] = '../node_modules/angular2/*';
//System.paths['angular2/*'] = '../node_modules/angular2/bundles/angular2.sfx.dev.js';

System.import('js/devtools');
System.import('js/tree-view/tree-view-component');