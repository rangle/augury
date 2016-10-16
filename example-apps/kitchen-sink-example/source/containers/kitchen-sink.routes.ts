import {
  Routes,
  RouterModule,
} from '@angular/router';

import AngularDirectives from '../components/angular-directives/angular-directives';
import {CamelCasePipe} from '../pipes/camelcase';
import ChangeDetection from '../components/change-detection/change-detection';
import Component1 from '../components/di-tree/component1';
import Component2 from '../components/di-tree/component2';
import Component3 from '../components/di-tree/component3';
import Component4 from '../components/di-tree/component4';
import Component5 from '../components/di-tree/component5';
import Component6 from '../components/di-tree/component6';
import ControlForm from '../components/form-controls/control-form';
import Counter from '../components/input-output/counter';
import DITree from '../components/di-tree/di-tree';
import Demo from '../components/demo/demo';
import DemoComponent from '../components/demo/demo-component';
import Form2 from '../components/form-controls/form2';
import HelloDirectives from '../components/angular-directives/hello-directives';
import Home from '../components/home';
import InputOutput from '../components/input-output/input-output';
import {
  MetadataFromArray,
  MetadataFromArrayWithCustomName,
  MetadataFromDecorator,
  MetadataFromDecoratorWithCustomName,
  MetadataTest,
} from '../components/metadata-test/metadata-test';
import MyForm from '../components/form-controls/my-form';
import NgClassDirective from '../components/angular-directives/ngclass-directive';
import NgForDirective from '../components/angular-directives/ngfor-directive';
import NgIfDirective from '../components/angular-directives/ngif-directive';
import NgLocalizationDirective from '../components/angular-directives/nglocalization-directive';
import NgStyleDirective from '../components/angular-directives/ngstyle-directive';
import NgSwitchDirective from '../components/angular-directives/ngswitch-directive';
import TodoApp from '../components/todo-app/todo-app';
import {TodoInput} from '../components/todo-app/todo-input';
import {TodoList} from '../components/todo-app/todo-list';
import {UserInfoDefault} from '../components/change-detection/user-info-default';
import {UserInfoPush} from '../components/change-detection/user-info-push';
import {
  StressTester,
  StressRecItem,
} from '../components/stress-tester/stress-tester';

export const KitchenSinkRoutes: Routes = [
  { path: '', component: Home },
  { path: 'input-output', component: InputOutput },
  { path: 'my-form', component: MyForm },
  { path: 'form2', component: Form2 },
  { path: 'control-form', component: ControlForm },
  { path: 'todo-app', component: TodoApp },
  { path: 'di-tree', component: DITree },
  { path: 'angular-directives', component: AngularDirectives },
  { path: 'change-detection', component: ChangeDetection },
  { path: 'demo', component: Demo },
  { path: 'stress-tester', component: StressTester },
  { path: 'metadata-test', component: MetadataTest },
  { path: 'lazy-load',
    loadChildren: '../components/lazy-load/lazy-load#LazyLoadedModule' },
];

export const KitchenSinkDeclarations = [
  AngularDirectives,
  CamelCasePipe,
  ChangeDetection,
  ControlForm,
  Counter,
  DITree,
  Demo,
  DemoComponent,
  Form2,
  HelloDirectives,
  Home,
  InputOutput,
  MetadataFromArray,
  MetadataFromArrayWithCustomName,
  MetadataFromDecorator,
  MetadataFromDecoratorWithCustomName,
  MetadataTest,
  MyForm,
  NgClassDirective,
  NgForDirective,
  NgIfDirective,
  NgLocalizationDirective,
  NgStyleDirective,
  NgSwitchDirective,
  StressTester,
  StressRecItem,
  TodoApp,
  TodoList,
  TodoInput,
  UserInfoDefault,
  UserInfoPush,
  Component1,
  Component2,
  Component3,
  Component4,
  Component5,
  Component6,
];
