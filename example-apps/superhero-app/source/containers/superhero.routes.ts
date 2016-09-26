import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

import { AboutComponent } from '../components/about/about.component';
import { GameComponent } from '../components/game/game.component';
import { GameButtonComponent } from '../components/game-button/game-button.component';
import { GameTitleComponent } from '../components/game-title/game-title.component';
import { HomeComponent } from '../components/home/home.component';
import { MatchesSummaryComponent } from '../components/matches-summary/matches-summary.component';
import { ScoresButtonComponent } from '../components/scores-button/scores-button.component';
import { StartButtonComponent } from '../components/start-button/start-button.component';
import { SubTitleComponent } from '../components/sub-title/sub-title.component';
import { SwipeComponent } from '../components/swipe/swipe.component';

export const AMI_SUPERHERO_DECLARATIONS = [
  AboutComponent,
  GameComponent,
  GameButtonComponent,
  GameTitleComponent,
  HomeComponent,
  MatchesSummaryComponent,
  ScoresButtonComponent,
  StartButtonComponent,
  SubTitleComponent,
  SwipeComponent
];

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'game/:count', component: GameComponent},
  { path: 'about', component: AboutComponent },
  { path: 'scores/:type', component: MatchesSummaryComponent },
];

export const AMI_SUPERHERO_ROUTES = RouterModule.forRoot(routes);
