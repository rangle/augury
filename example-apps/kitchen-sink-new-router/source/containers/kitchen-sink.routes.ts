import { Routes, RouterModule } from '@angular/router';

import Home from '../components/home';
import InputOutput from '../components/input-output/input-output';
import MyForm from '../components/form-controls/my-form';
import Form2 from '../components/form-controls/form2';
import DynamicControls from '../components/dynamic-controls/dynamic-controls';
import ControlForm from '../components/form-controls/control-form';
import TodoApp from '../components/todo-app/todo-app';
import DITree from '../components/di-tree/di-tree';
import ChangeDetection from '../components/change-detection/change-detection';
import AngularDirectives from
  '../components/angular-directives/angular-directives';
import Demo from '../components/demo/demo';
import StressTester from '../components/stress-tester/stress-tester';
import MetadataTest from '../components/metadata-test/metadata-test';

export const KitchenSinkRoutes: Routes = [
  { path: '', component: Home },
  { path: 'input-output', component: InputOutput },
  { path: 'my-form', component: MyForm },
  { path: 'form2', component: Form2 },
  { path: 'control-form', component: ControlForm },
  { path: 'dynamic-controls', component: DynamicControls },
  { path: 'todo-app', component: TodoApp },
  { path: 'di-tree', component: DITree },
  { path: 'angular-directives', component: AngularDirectives },
  { path: 'change-detection', component: ChangeDetection },
  { path: 'demo', component: Demo },
  { path: 'stress-tester', component: StressTester },
  { path: 'metadata-test', component: MetadataTest },
];

export const KitchenSinkDeclarations = [
  Home,
  InputOutput,
  MyForm,
  Form2,
  DynamicControls,
  ControlForm,
  TodoApp,
  DITree,
  ChangeDetection,
  AngularDirectives,
  Demo,
  StressTester,
  MetadataTest
];
