System.defaultJSExtensions = true;

System.paths['immutable'] = '../../../../node_modules/immutable/dist/immutable.js';
System.paths['rx'] = '../../../../node_modules/rx/dist/rx.all.js';
System.paths['angular2/*'] = '../../../../node_modules/angular2/*';
System.paths['@reactivex/rxjs/*'] = '../../../../node_modules/@reactivex/rxjs/*';
System.paths['es6-shim'] = '../../../../node_modules/es6-shim/es6-shim.js';
System.paths['reflect-metadata'] = '../../../../node_modules/reflect-metadata/Reflect.js';
System.paths['zone.js'] = '../../../../node_modules/zone.js/dist/zone.js';

System.meta = {
  'angular2/angular2': {
    'deps': [
      'reflect-metadata',
      'zone.js',
      'es6-shim',
      '@reactivex/rxjs'
    ]
  }
}

System.import('../../../js/batarangle/frontend/batarangle');