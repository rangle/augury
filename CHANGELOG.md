# Change Log
## [1.5.0](https://github.com/rangle/tree/1.5.0)
* Fix buggy serialization of maps and arrays [992](https://github.com/rangle/augury/pulls/992)
* Update to work with changes in non-public Angular APIs [1039](https://github.com/rangle/augury/pulls/1039)
* Add descriptive attributes to form elements in component tree [1016](https://github.com/rangle/augury/pulls/1016)
* Fix error message not persisting on Augury close/open [304](https://github.com/rangle/augury/pulls/304)

## [1.4.0](https://github.com/rangle/tree/1.4.0)
* Fix security issue with malicious message sources [1030](https://github.com/rangle/augury/pulls/1030)
* Fixed empty routes on Augury reopen. [1018](https://github.com/rangle/augury/issues/1018)
* Add "not Angular 2" message. [304](https://github.com/rangle/augury/issues/304)

## [1.3.0](https://github.com/rangle/tree/1.3.0)
* Fix for Chrome popup icons.
* Added Github issue report generation to Chrome popup.
* Add "no routes" message. [817](https://github.com/rangle/augury/issues/817)
* Removed last of example applications from this repo. [896](https://github.com/rangle/augury/issues/896)
* Added support for lazy loaded NgModules. [916](https://github.com/rangle/augury/issues/916)
* Fixed exception arising from empty modules config. [999](https://github.com/rangle/augury/issues/999)
* Added router-outlet "name" attribute to component tree view. [921](https://github.com/rangle/augury/issues/921)

## [1.2.12](https://github.com/rangle/tree/1.2.12)
* Hotfix for empty (root only) routers. [970](https://github.com/rangle/augury/issues/970)

## [1.2.11](https://github.com/rangle/tree/1.2.11)
* Remove "Properties" accordion. [663](https://github.com/rangle/augury/issues/663)
* Fix route data parsing. [914](https://github.com/rangle/augury/issues/914)
* Fix nested route paths. [917](https://github.com/rangle/augury/issues/917)
* Improve router tree style in dark mode. [880](https://github.com/rangle/augury/issues/880)
* Improve indenting in object accordions. [857](https://github.com/rangle/augury/issues/857)
* Fix issue with no-arg NgModules. [958](https://github.com/rangle/augury/issues/958)
* Add issue reporting links.
* Add support for `@Inject` decorated constructor injection. [851](https://github.com/rangle/augury/issues/851)
* Fix incorrect component order in "Hybrid" component tree mode. [925](https://github.com/rangle/augury/issues/925)

## [1.2.10](https://github.com/rangle/tree/1.2.10)
* Fix issue with NgModule references in injector graph. [918](https://github.com/rangle/augury/issues/918)

## [1.2.9](https://github.com/rangle/tree/1.2.9)
* Fix injecting router breaking component state. [699](https://github.com/rangle/augury/issues/699)
* Fix for string based providers in NgModule parsing. [922](https://github.com/rangle/augury/issues/922)

## [1.2.8](https://github.com/rangle/tree/1.2.8)
* Automatically resolve router when possible. [829](https://github.com/rangle/augury/issues/829)
* Add NgModules tab feature. [764](https://github.com/rangle/augury/issues/764)
* Add NgModule context to Components and Injectables in Injector Graph. [803](https://github.com/rangle/augury/issues/803)
* Improve frontend module/app declaration & fix swallowed keypresses in component tree.
* Improve styling of instance properties and make them editable.

## [1.2.7](https://github.com/rangle/tree/1.2.7)
* Fixed/improved injector graph to show just injected providers and their provider origin. [624](https://github.com/rangle/augury/issues/624)

## [1.2.6](https://github.com/rangle/tree/1.2.6)
* Added mouse selection and hover highlighting of dom elements. [641](https://github.com/rangle/augury/issues/641)
* Updated architecture overview image [#824](https://github.com/rangle/augury/issues/824)
* Minor code optimizations [#830](https://github.com/rangle/augury/issues/830) & [#831](https://github.com/rangle/augury/issues/831)
* Added more complete provider descriptions for non-components [#662](https://github.com/rangle/augury/issues/662)
* Fixed issue with breadcrumb link in the injector graph [#837](https://github.com/rangle/augury/issues/837)
* Fixed typo in 'kitchen sink' example app
* Fixed issue with dependency origin in injector graph and added support for `@SkipSelf` [#802](https://github.com/rangle/augury/issues/802)
* Optimized redundant posting out of message queue logic [#832](https://github.com/rangle/augury/issues/832)
* Added first of new example apps (Input/Output demo) [#804](https://github.com/rangle/augury/issues/804)
* Added safeguards to Router resolution [#848](https://github.com/rangle/augury/issues/848)

## [1.2.5](https://github.com/rangle/tree/1.2.5)
* Update kitcken sink example app to Angular 2.2.0. [792](https://github.com/rangle/augury/issues/792)
* Resolve conflict with Jira boards. [766](https://github.com/rangle/augury/issues/766)
* Remove Angular core dependency from backend bundle. [782](https://github.com/rangle/augury/issues/782)

## [1.2.4](https://github.com/rangle/tree/1.2.4)
* Add new support for decorators: `@ViewChild`, `@ViewChildren`, `@ContentChild`, and `@ContentChildren`. Now we display these decorators, along with the type selector information, in the UI.
* Add proper type information to State panel view. Instead of displaying `Object`, for example, we display the real type of that object, for example `NgModuleLoader`. We do this by retaining the type information across serialization. (Objects are serialized in the backend and then transmitted to the frontend, and the type information was being lost during this process. Now it is retained.)
* Refactor the decorator metadata system so that it works for nested objects. In 1.2.3, if you have a `@ViewChild(Foo)` reference on your component, and you expand that object in the State view, any `@Input()` or `@Output()` decorators on the `Foo` object are now displayed in the UI. (Previously decorator metadata was only generated for toplevel components.)
* Resolve display issue that prevented pages containing multiple Angular applications from working properly. Now if you have multiple Angular root components on your page, you will be able to see both of them in the _Component Tree_ tab.

## [1.2.3](https://github.com/rangle/tree/1.2.3)
* Add AoT compilation section to readme. ([733](https://github.com/rangle/augury/issues/733))
* Make sure events emitted form Augury are run in an NgZone as expected. ([752](https://github.com/rangle/augury/issues/752))

## [1.2.2](https://github.com/rangle/tree/1.2.2)
* Changes to OnPush components in the state editor are now reflected immediately in the app. ([559](https://github.com/rangle/augury/issues/559))
* Resolve performance issue due to bug in which JSON patch library is not able to compare undefined values. ([727](https://github.com/rangle/augury/issues/727))
* Resolve issue where some ES6 shims conflict with Augury (asana.com). ([734](https://github.com/rangle/augury/issues/734))
* Router tree now supports lazy loaded modules. ([628](https://github.com/rangle/augury/issues/628))
* `$a` is now defined as a warning message in the extension context. ([684](https://github.com/rangle/augury/issues/684))

## [1.2.1](https://github.com/rangle/tree/1.2.1)
* The Router Tree no longer cuts off trees which are too large. ([401](https://github.com/rangle/augury/issues/401))
* The Component Tree scrollbars no longer overlap the info pane. ([682](https://github.com/rangle/augury/issues/682))

## [1.2.0](https://github.com/rangle/tree/1.2.0)
* Augury now inspects applications built on Angular 2.0.0.
* Property lines no longer jump around when entering and exiting edit. ([652](https://github.com/rangle/augury/issues/652))
* Emitter widgets in the state editor no longer overlap the settings dropdown. ([661](https://github.com/rangle/augury/issues/661))
* The Injector Graph and the Router Tree have been polished and refined. ([672](https://github.com/rangle/augury/pull/672))
* Augury no longer loses context when the user clicks "(view source)" on a component. ([666](https://github.com/rangle/augury/issues/666))
* The Find box has been moved directly into Component Tree and Router Tree. ([566](https://github.com/rangle/augury/issues/566))
* Augury now filters normal HTML elements out of the Injector Graph ([633](https://github.com/rangle/augury/pull/633))
* You can now navigate the Component Tree with your keyboard. ([635](https://github.com/rangle/augury/pull/635))

## [1.1.3](https://github.com/rangle/tree/1.1.3)
* Resolve another endless-flicker issue caused by providers with undefined keys

## [1.1.2](https://github.com/rangle/tree/1.1.2)
* Resolve a bug that caused an internal communication pipe to become clogged with empty tree diff messages, which in turn caused UI latency
* Resolve an issue with @Input() decoration not appearing in the "State" panel in some cases

## [1.1.1](https://github.com/rangle/tree/1.1.1)
* Assorted style fixes.
* All-new "expand all" (Command/Ctrl-Click) and "collapse all" (Alt-Click) functionality in the Component Tree. ([629](https://github.com/rangle/augury/issues/629))
* Fix flickering update issue and lodash name collision issue. ([630](https://github.com/rangle/augury/issues/630))
* Fix recursive serialization issue that Eric found. ([618](https://github.com/rangle/augury/618))
* Remember expand actions in "State" view between component selection changes. ([620](https://github.com/rangle/augury/issues/620))

## [1.1.0](https://github.com/rangle/augury/tree/1.1.0)
* Port Augury to Angular 2.0.0 RC6 ([524](https://github.com/rangle/augury/issues/524), [563](https://github.com/rangle/augury/issues/563))
* Remove support for the deprecated router ([590](https://github.com/rangle/augury/issues/590))
* Move @Output info to the state editor, remove the Outputs accordion. ([606](https://github.com/rangle/augury/issues/606))
* Move @Input info to the state editor, remove the Inputs accordion. ([605](https://github.com/rangle/augury/issues/605))
* Display the state editor tree collapsed by default. ([610](https://github.com/rangle/augury/issues/610))
* Show the change detection strategy bare instead of in an accordion. ([607](https://github.com/rangle/augury/issues/607))
* Reduce component tree serialization overhead. ([592](https://github.com/rangle/augury/issues/592))
* Redraw augury-logo.svg and clean up Triangle.svg to prevent aliasing in Skia ([587](https://github.com/rangle/augury/issues/587))
* Rework the Router Tree and the Injector Tree ([585](https://github.com/rangle/augury/issues/585))
* Remove the Children accordion from Component Info since that information is available in the state editor and component tree. ([584](https://github.com/rangle/augury/issues/584))
* Simplify theming system and centralize color definitions. ([580](https://github.com/rangle/augury/issues/580))
* Improve performance by avoiding deep cloning in the JSON diff/patch utility. ([573](https://github.com/rangle/augury/issues/573))
* Only expand the Component Tree 3 levels deep by default. ([558](https://github.com/rangle/augury/issues/558))
* Massive refactoring of entire backend and most of the frontend. ([546](https://github.com/rangle/augury/issues/546))
* Add more graceful error handling and display a helpful message when the target application is not running in debug mode ([603](https://github.com/rangle/augury/issues/603))
* Reintroduce route search ([579](https://github.com/rangle/augury/issues/579))
* Hide Component Info accordions when they are empty. ([575](https://github.com/rangle/augury/issues/575))
* Make the Info Panel resizable. ([537](https://github.com/rangle/augury/issues/537))
* Run Augury's Angular 2 instance in production mode. ([530](https://github.com/rangle/augury/issues/530))
* Fix: $a is not being defined on regular elements (only components) ([615](https://github.com/rangle/augury/issues/615))
* Fix: Escape double quotes in node description so that sanitizeHtml doesn't complain. ([522](https://github.com/rangle/augury/issues/522))
* Fix: Settings menu doesn't close when the user clicks outside of it. ([436](https://github.com/rangle/augury/issues/436))

## [1.0.5](https://github.com/rangle/augury/tree/1.0.5)
* Performance improvements ([493](https://github.com/rangle/augury/issues/493), [504](https://github.com/rangle/augury/issues/504))
* Bug fixes for search ([496](https://github.com/rangle/augury/issues/496), [511](https://github.com/rangle/augury/issues/511))
* Fixed an issue where highlighting would thrown an error ([487](https://github.com/rangle/augury/issues/487))
* Support for @angular/router version 3.0.0-beta.2

## [1.0.4](https://github.com/rangle/augury/tree/1.0.4)
* Update Augury to RC4 ([474](https://github.com/rangle/augury/issues/474))
* Input & Output only show up when declared in metadata array ([472](https://github.com/rangle/augury/issues/472))
* Router checking ([465](https://github.com/rangle/augury/issues/465))
* Stress test Augury ([464](https://github.com/rangle/augury/issues/464))
* Add a build step to the kitchen-sink-example app ([460](https://github.com/rangle/augury/issues/460))
* Color Settings popup should be consistent with theme ([459](https://github.com/rangle/augury/issues/459))

## [1.0.3](https://github.com/rangle/augury/tree/1.0.3)
* Augury supports projects written in Angular 2.0.0-rc.3
* Update Augury to Angular 2.0.0-rc.3 ([450](https://github.com/rangle/augury/issues/450))
* Fix a bug where graph colors in Router Tree were not matching the dark theme ([435](https://github.com/rangle/augury/issues/435))
* Ignore build output ([453](https://github.com/rangle/augury/issues/453))
* Rename `openedNodes` to `closedNodes` for clarity ([363](https://github.com/rangle/augury/issues/363))

## [1.0.2](https://github.com/rangle/augury/tree/1.0.2)
* Settings menu should close when click outside of it bug ([436](https://github.com/rangle/augury/issues/436))
* Graphs colors need to match the rest of the design in dark theme bug ([435](https://github.com/rangle/augury/issues/435))
* Augury should save the dark theme settings chore help wanted ([423](https://github.com/rangle/augury/issues/423))
* Not working with Angular 2.0.0-rc.1 ([416](https://github.com/rangle/augury/issues/416))
* Augury: Does not render a component under component tree when i refresh the page. bug ([415](https://github.com/rangle/augury/issues/415))
* Move the header bar ([404](https://github.com/rangle/augury/issues/404))
* How to Run Angular 2 function in chrome debug console??? ([402](https://github.com/rangle/augury/issues/402))
* RC1 support chore ([395](https://github.com/rangle/augury/issues/395))
* Add a message about RC1 support feature ([390](https://github.com/rangle/augury/issues/390))
* Augury not working bug ([386](https://github.com/rangle/augury/issues/386))
* Batarangle's UI is much easier to use ([385](https://github.com/rangle/augury/issues/385))
* Selecting the Old Component doesn't render more info bug ([381](https://github.com/rangle/augury/issues/381))
* No support for dark mode in Chrome ([378](https://github.com/rangle/augury/issues/378))
* Reload of browser window breaks augury bug ([377](https://github.com/rangle/augury/issues/377))
* "Cannot read property 'root' of undefined" console error when viewing router tree ([376](https://github.com/rangle/augury/issues/376))
* Fix Augury hanging on load on Chrome Canary ([394](https://github.com/rangle/augury/issues/394))

## [1.0.1](https://github.com/rangle/augury/tree/1.0.1) (2016-05-28)
* [Changes](https://github.com/rangle/augury/compare/1.0.1...v0.0.3)

## [v0.0.3](https://github.com/rangle/augury/tree/v0.0.3) (2016-03-15)
* [Changes](https://github.com/rangle/augury/commits/0d2483568e5d4dd631f15e010064d771c9755680)
