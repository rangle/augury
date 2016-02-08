// Load Global Styles
import {ROUTER_PROVIDERS, LocationStrategy,
  HashLocationStrategy, APP_BASE_HREF} from 'angular2/router';
import {provide} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';

import {bootstrap} from 'angular2/bootstrap';

import KitchenSink from './containers/kitchen-sink';

// For Batarangle Integration
import {AppViewListener} from 'angular2/src/core/linker/view_listener';
import {DebugElementViewListener, inspectNativeElement}
  from 'angular2/platform/common_dom';
import {bind} from 'angular2/core';

bootstrap(KitchenSink, [
  ROUTER_PROVIDERS,
  FORM_DIRECTIVES,
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(APP_BASE_HREF, {useValue: '/'}),
  bind(AppViewListener).toClass(DebugElementViewListener)
])
.then(applicationReference => {
  const w: any = window;
  w.ng.probe = inspectNativeElement;
});
