import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AmiSuperherosApp } from './app.component';
import { AboutComponent } from './about/about.component';
import { GameComponent } from './game/game.component';
import { GameButtonComponent } from './game-button/game-button.component';
import { GameTitleComponent } from './game-title/game-title.component';
import { ScoreButtonComponent } from './scores-button/scores-button.component';
import { ScoresButtonComponent } from './scores-button/scores-button.component';
import { HomeComponent } from './home/home.component';
import { StartButtonComponent } from './start-button/start-button.component';
import { SubTitleComponent } from './sub-title/sub-title.component';
import { ScoresComponent } from './scores/scores.component';

@NgModule({
  declarations: [
    AmiSuperherosApp,
    AboutComponent,
    GameComponent,
    GameButtonComponent,
    GameTitleComponent,
    ScoreButtonComponent,
    ScoresButtonComponent,
    HomeComponent,
    StartButtonComponent,
    SubTitleComponent,
    ScoresComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AmiSuperherosApp]
})
export class AppModule { }
