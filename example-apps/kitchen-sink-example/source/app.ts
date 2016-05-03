// Load Global Styles
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';

import {provide} from '@angular/core';
import {FORM_DIRECTIVES, LocationStrategy,
 HashLocationStrategy, APP_BASE_HREF} from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';

import KitchenSink from './containers/kitchen-sink';
import {TodoService, FormatService} from './components/todo-app/todo-service';

bootstrap(KitchenSink, [
  ROUTER_PROVIDERS,
  FORM_DIRECTIVES,
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(APP_BASE_HREF, {useValue: ''}),
  TodoService,
  FormatService
]);
