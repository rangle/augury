import {
  Routes,
  RouterModule,
} from '@angular/router';

import {
  RouterToy,
  RouterToyAux,
  RouterToyChild,
  RouterToyData1,
  RouterToyData2,
  RouterToyInnerChild,
  RouterToyInnerChild2,
  RouterToyInnerChildMain,
  RouterToyMain,
} from './router-toy';

export const RouterToyRoutes: Routes = [
  { path: 'router-toy', component: RouterToy, children: [
    { path: 'main', component: RouterToyMain },
    { path: 'aux', component: RouterToyAux, outlet: 'aux' },
    { path: 'child', component: RouterToyChild },
    { path: 'data-1/:name', component: RouterToyData1 },
    { path: 'data-2/:name/:message', component: RouterToyData2 },
    { path: 'inner-child', component: RouterToyInnerChild, children: [
      { path: '', component: RouterToyInnerChildMain },
      { path: 'child-2', component: RouterToyInnerChild2 }
    ]},
  ]}
];

export const RouterToyDeclarations = [
  RouterToy,
  RouterToyAux,
  RouterToyChild,
  RouterToyData1,
  RouterToyData2,
  RouterToyInnerChild,
  RouterToyInnerChild2,
  RouterToyInnerChildMain,
  RouterToyMain,
];
