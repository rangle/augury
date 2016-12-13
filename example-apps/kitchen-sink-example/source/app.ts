import { NgModule } from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import {RouterModule} from '@angular/router';


@NgModule({
  imports: [
    FormsModule,
  ],
})
class TestModule {}

import {
  APP_BASE_HREF,
  HashLocationStrategy,
  LocationStrategy,
  NgLocalization,
} from '@angular/common';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import KitchenSink from './containers/kitchen-sink';
import { APP_ROUTER_PROVIDERS, APP_DECLARATIONS } from './app.routes';
import { TodoService, FormatService } from './components/todo-app/todo-service';

import Service1 from './services/service1';
import Service2 from './services/service2';
import Service3 from './services/service3';
import Service4 from './services/service4';

class MyLocalization extends NgLocalization {
   getPluralCategory(value: any) {
      if (value < 5) {
         return 'few';
      }
   }
}

@NgModule({
  imports:      [
    TestModule,
    BrowserModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    APP_ROUTER_PROVIDERS,
  ],
  declarations: [
    KitchenSink,
    APP_DECLARATIONS,
  ],
  bootstrap: [ KitchenSink ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: NgLocalization, useClass: MyLocalization },
    FormatService,
    TodoService,
    Service1,
    Service2,
    Service3,
    Service4,
  ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
