# Augury

[![Circle CI](https://circleci.com/gh/rangle/augury.svg?style=svg)](https://circleci.com/gh/rangle/augury) [![Slack Status](https://augury-slack.herokuapp.com/badge.svg)](https://augury-slack.herokuapp.com)
[![Stories in Ready](https://badge.waffle.io/rangle/augury.svg?label=ready&title=Ready)](https://waffle.io/rangle/augury)

[Augury](https://augury.angular.io/) is a Google Chrome Dev Tools extension for debugging Angular 2 applications. You can install the extension from [Chrome Store](https://chrome.google.com/webstore/detail/augury/elgalmkoelokbchhkhacckoklkejnhcd).

Once the extenion is installed you can test it against the demo application https://augury.angular.io/demo/

![Screenshot of Augury](assets/screenloop.gif)

## Supported Version

Currently works with applications built in [Angular 2.0.0](https://github.com/angular/angular/blob/master/CHANGELOG.md#200-2016-09-14) using the Angular Component Router version `3.0.0-beta.2`.

To view the router graph inject the Router in the application root component as shown below (it must be named `router` exactly).
```js
export default class KitchenSink {
  constructor(private router: Router) {
  }
}
```
[Example](https://github.com/rangle/augury/blob/dev/example-apps/kitchen-sink-example/source/containers/kitchen-sink.ts)

## Support for AoT (Ahead-Of-Time) Compilation

In order for Angular to expose the debug information for AoT applications, you will have to explicitly set the debug flag to `true` in your project's `tsconfig.json` as such:
```json
"angularCompilerOptions": {
  "debug": true
}
```
Note that this debug flag and `development mode` in Angular runtime are two completely different settings. 

To learn more about AoT compilation, visit [this section of Angular documentation](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html).


## Development Environment

To develop this extension, the following environment is used:

* Node 4.2.3
* NPM 3.5.3
* TypeScript 1.8.9
* typings 1.3.2

## Installation

### Pre-packaged

- You can install this extension from the [Chrome Webstore](https://chrome.google.com/webstore/detail/augury/elgalmkoelokbchhkhacckoklkejnhcd?hl=en-US)

### Building & installing locally

1. Clone this repository: `git clone git://github.com/rangle/augury`.
2. Run `npm install`.
3. Run `npm run dev-build`.
4. Navigate to chrome://extensions and enable Developer Mode.
5. Choose "Load unpacked extension".
6. In the dialog, open the directory you just cloned.

Try out the extension with one of our [example applications](#Examples).

## Running Tests

To execute all unit tests, run `npm test`. It bundles up all files that match `*.test.ts` into `build/test.js`, then runs it through tape-run in a headless Electron browser.

## Available NPM Scripts

- `build` Build the extension
- `webpack` Run webpack
- `clean` Clean `node_modules` and `typings`,
- `postinstall` install typings
- `start` Clean build and run webpack in watch mode
- `test` Bundle all *.test.ts and run it through a headless browser
- `prepack` Run npm build before running npm pack
- `pack` Packages the extension and create chrome build augury.crx

## Examples

- [Kitchen Sink Demo](./example-apps/kitchen-sink-example/README.md)
- [Superhero Tinder](./example-apps/superhero-app/README.md)

## Issues

### Known Issues

We are using GitHub Issues for our public bugs. We will keep track on this and will to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn't already exist.

### Reporting Issues

The best way to get a bug fixed is to provide a test case with either one of the example apps bundled in the repo, or by making your own Angular 2.0 application illustrating the reduced use case.

## Contributing

If you'd like to help out, please read our [Contributing Guidelines](CONTRIBUTING.md). You might want to first checkout the [Architecture of this extension](./docs/ARCHITECTURE.md).

## Join Our Slack Team

If you want to contribute or need help getting started, [join us on Slack](https://augury-slack.herokuapp.com).

## License
[MIT](LICENSE)
