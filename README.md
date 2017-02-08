# Augury

[![Circle CI](https://circleci.com/gh/rangle/augury.svg?style=svg)](https://circleci.com/gh/rangle/augury) [![Slack Status](https://augury-slack.herokuapp.com/badge.svg)](https://augury-slack.herokuapp.com)
[![Stories in Ready](https://badge.waffle.io/rangle/augury.svg?label=ready&title=Ready)](https://waffle.io/rangle/augury)

[Augury](https://augury.angular.io/) is a Google Chrome Dev Tools extension for debugging Angular 2 applications. You can install the extension from [Chrome Store](https://chrome.google.com/webstore/detail/augury/elgalmkoelokbchhkhacckoklkejnhcd).


## Supported version

Augury works with application built starting with Angular 2.0.

# Known issues

## Router graph

To be able to view the router graph, you will need to inject the Router in the application _Root_ component as shown below (it must be named `router` exactly).

```js
export default class KitchenSink {
  constructor(private router: Router) {
  }
}
```

[Example code](https://github.com/rangle/augury/blob/dev/example-apps/kitchen-sink-example/source/containers/kitchen-sink.ts#L75)

## Support for AoT (Ahead-Of-Time) compilation

In order for Angular to expose the debug information for AoT applications, you will have to explicitly set the debug flag to `true` in your project's `tsconfig.json` as such:

```json
"angularCompilerOptions": {
  /* ... */
  "debug": true
}
```

_Note_: This debug flag and `development mode` in Angular runtime are two completely different settings.

To learn more about AoT compilation, visit [this section of Angular documentation](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html).

## Support for `enableDebugTools()`

Prior to [Angular 2.2.0](https://github.com/angular/angular/blob/master/CHANGELOG.md#220-upgrade-firebooster-2016-11-14), `enableDebugTools()` would clobber `ng.probe`, which breaks Augury. Prior to that version, [this workaround](https://github.com/AngularClass/angular2-webpack-starter/blob/dbb7d10e6e84b8e88116d957f0047b422ab807c1/src/app/environment.ts#L28...L36) will circumvent the issue.

---
## Working on Augury

### Development environment

To develop the Augury extension, the following environment is used:

* Node
* NPM
* TypeScript

### Building & installing locally

```bash
git clone git://github.com/rangle/augury
cd augury
npm install
npm run dev-build
```

1. Navigate to chrome://extensions and enable Developer mode.
1. Choose "Load unpacked extension".
1. In the dialog, open the directory you just cloned.

Try out the extension with one of our [example applications](#examples).

### Running tests

To execute all unit tests, run `npm test`. It bundles up all files that match `*.test.ts` into `build/test.js`, then runs it through tape-run in a headless Electron browser.

### Available NPM scripts

To see all available script type `npm run` in the terminal. The following command are the ones you will mostly be working with.

Command|Descrption
-------|----------
`build`|Build the extension
`webpack`|Run webpack
`clean`|Clean `node_modules` and `typings`,
`postinstall`|install typings
`start`|Clean build and run webpack in watch mode
`test`|Bundle all *.test.ts and run it through a headless browser
`prepack`|Run npm build before running npm pack
`pack`|Packages the extension and create chrome build augury.crx

## Reporting issues

Please search to make sure your issue is not already been reported.

You should report an issue directly from Augury, by clicking on the Augury icon next to the address bar in the browser. It will open up a popup menu with a link to Issue reporting.

![Image Issue reporting](images/augury-popup-icon.png)

## Contributing

### General guidelines

If you'd like to help out, please read our [Contributing Guidelines](https://augury.angular.io/pages/guides/contribute.html).

### Augury Architecture

You might want to first checkout the [Architecture of this extension](https://augury.angular.io/pages/guides/architecture.html).

### Join on Slack

If you want to contribute or need help getting started, [join us on Slack](https://augury-slack.herokuapp.com).

### License
[MIT](LICENSE)
