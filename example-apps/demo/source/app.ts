import {
  Component,
  NgModule,
} from '@angular/core';

import {
  Router,
  RouterModule,
  Routes,
} from '@angular/router';

import {
  APP_BASE_HREF,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';

import {
  RouterToyRoutes,
  RouterToyDeclarations,
} from './components/router-toy/router-toy.routes';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import {
  Service1,
  Service2,
  Service3,
  Service4,
} from './services';

import {
  InjectorTree,
  InjectorTreeDummy1,
  InjectorTreeDummy2,
  InjectorTreeDummy3,
  InjectorTreeDummy4,
  InjectorTreeDummy5,
  InjectorTreeDummy6,
} from './components/injector-tree/injector-tree';
import { InputOutput, Counter } from './components/input-output/input-output';

@Component({
  selector: 'augury-taster',
  template: require('./augury-taster.html'),
})
class AuguryTaster {
  path: string = '';

  constructor (router: Router) {
    router.events.subscribe(({url}) => { this.path = url; });
  }
}

const routerProviders = RouterModule.forRoot([
  { path: 'input-output', component: InputOutput },
  { path: 'injector-tree', component: InjectorTree },
  { path: '', component: InjectorTree },
    ...RouterToyRoutes
]);

const declarations = [
  AuguryTaster,
  Counter,
  InjectorTree,
  InjectorTreeDummy1,
  InjectorTreeDummy2,
  InjectorTreeDummy3,
  InjectorTreeDummy4,
  InjectorTreeDummy5,
  InjectorTreeDummy6,
  InputOutput,
    ...RouterToyDeclarations,
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    routerProviders,
  ],
  declarations,
  bootstrap: [ AuguryTaster ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    Service1,
    Service2,
    Service3,
    Service4,
    InjectorTree,
  ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
