import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { GameService } from './services/game.service';
import { HerosService } from './services/heros.service';
import { VillansService } from './services/villans.service';

import { SuperherosApp } from './containers/superhero';

import { AMI_SUPERHERO_ROUTES, AMI_SUPERHERO_DECLARATIONS } from './containers/superhero.routes';

@NgModule({
  declarations: [
    SuperherosApp,
    AMI_SUPERHERO_DECLARATIONS
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AMI_SUPERHERO_ROUTES
  ],
  providers: [HerosService, VillansService, GameService],
  bootstrap: [SuperherosApp]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
