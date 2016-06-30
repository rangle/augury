import {provide} from '@angular/core';
import {FORM_DIRECTIVES, APP_BASE_HREF, LocationStrategy,
 HashLocationStrategy } from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';

import { APP_ROUTER_PROVIDERS } from './app.routes';
import KitchenSink from './containers/kitchen-sink';

import {TodoService, FormatService} from './components/todo-app/todo-service';

bootstrap(KitchenSink, [
  APP_ROUTER_PROVIDERS,
  { provide: APP_BASE_HREF, useValue: '/' },
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  FORM_DIRECTIVES,
  TodoService,
  FormatService
]).catch(err => console.error(err));
