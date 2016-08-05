import {provide} from '@angular/core';
import {FORM_DIRECTIVES, APP_BASE_HREF, LocationStrategy,
 HashLocationStrategy } from '@angular/common';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import { RouterModule } from '@angular/router';

import { APP_ROUTER_PROVIDERS } from './app.routes';
import KitchenSink from './containers/kitchen-sink';

import {TodoService, FormatService} from './components/todo-app/todo-service';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [KitchenSink],
  imports: [BrowserModule, FormsModule, RouterModule.forRoot(APP_ROUTER_PROVIDERS)],
  providers: [TodoService, FormatService],
  bootstrap: [KitchenSink]
})
class KitchenSinkModule {}

platformBrowserDynamic().bootstrapModule(KitchenSinkModule);