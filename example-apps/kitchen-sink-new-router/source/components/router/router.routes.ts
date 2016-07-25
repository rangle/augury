import { RouterConfig } from '@angular/router';

import Start from './start';
import StartChild from './start-child';
import StartMain from './start-main';
import InnerChild from './inner-child';
import RouterData1 from './router-data1';
import RouterData2 from './router-data2';
import AuxComp from './aux-comp';

import InnerChild2 from './inner-child2';
import InnerChildMain from './inner-child-main';

export const RouterRoutes: RouterConfig = [
  { path: 'start', component: Start, children: [
    { path: 'main', component: StartMain },
    { path: 'auxcomp', component: AuxComp, outlet: 'aux' },
    { path: 'child', component: StartChild },
    { path: 'router-data1/:name', component: RouterData1 },
    { path: 'router-data2/:name/:message', component: RouterData2 },
    { path: 'inner-child', component: InnerChild, children: [
      { path: '', component: InnerChildMain },
      { path: 'child2', component: InnerChild2 }
    ]},
  ]}
];
