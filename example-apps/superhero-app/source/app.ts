import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { GameService } from './services/game.service';
import { CharacterService } from './services/character.service';

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
  providers: [GameService, CharacterService],
  bootstrap: [SuperherosApp]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
