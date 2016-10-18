import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


@Component({
  template: `<H1>Lazy Loaded Component One</H1>`
})
class LazyLoadedComponentOne {}

const routes: Routes = [
  { path: 'lazy1', component: LazyLoadedComponentOne },
];

@NgModule({
  imports: [  RouterModule.forChild(routes) ],
  declarations: [ LazyLoadedComponentOne ]
})
export class LazyLoadedModule { }
