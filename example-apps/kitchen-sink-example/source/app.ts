import { NgModule, provide } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import {APP_BASE_HREF, LocationStrategy, HashLocationStrategy }
 from '@angular/common';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import KitchenSink from './containers/kitchen-sink';
import { APP_ROUTER_PROVIDERS, APP_DECLARATIONS } from './app.routes';
import { TodoService, FormatService } from './components/todo-app/todo-service';

import Home from './components/home';

@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    APP_ROUTER_PROVIDERS
  ],
  declarations: [
    KitchenSink,
    ...APP_DECLARATIONS
  ],
  bootstrap:    [ KitchenSink ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    provide(LocationStrategy, { useClass: HashLocationStrategy }),
    TodoService,
    FormatService
  ]
})
class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
