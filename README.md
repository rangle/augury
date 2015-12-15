# Angular 2.0 Batarangle

[![Circle CI](https://circleci.com/gh/rangle/batarangle.svg?style=svg&circle-token=7df1edad916fdc18b7bfddc60ff694871570359c)](https://circleci.com/gh/rangle/batarangle) [![Slack Status](https://batarangle-slack.herokuapp.com/badge.svg)](https://batarangle-slack.herokuapp.com)

Batarangle is a Google Chrome Dev Tools extension for debugging Angular 2 applications. Treat this as a "developer preview". Unitl the official release, please follow instructions below to build the tool locally and install it from source. It's actually quite easy.

![Screenshot of Batarangle](images/screenloop.gif)

## Join Our Slack Team

If you want to contribute or need help getting started, [join us on Slack](https://batarangle-slack.herokuapp.com).

## Development Environment

To develop this extension, the following environment is used:

* Node v4.2.1
* NPM 3.3.10
* TypeScript 1.6.2
* tsd 0.6.5

In addition, example applications all run with a globablly installed version of jspm 0.16.12.

## Trying out the extension

1. Clone this repository: `git clone git://github.com/rangle/batarangle`.
2. Run `npm install`.
3. Run `npm run build` (errors related to typing files conflicts can be ignore for now).
4. Navigate to chrome://extensions and enable Developer Mode.
5. Choose "Load unpacked extension".
6. In the dialog, open the directory you just cloned.

To try out with an example application, refer to instructions in [README](./example-apps/todo-mvc-example/README.md).

In order to use this extension with your own application, you will need to make a slight modification to your code. See section [Current Limitation](#current-limitations) below for more detailed instructions.

## Running Tests

To execute all unit tests, run `npm test`. It bundles up all files that match `*.test.ts` into `build/test.js`, then runs it through tape-run in a headless Electron browser.

## Available NPM Scripts

- `build` Build the extension
- `webpack` Run webpack
- `clean` Clean `node_modules` and `typings`,
- `remove-tsd-loader-typings` Remove tsd loader typings
- `tsd-update` Update tsd
- `postinstall` Update tsd and install/link typings
- `start` Clean build and run webpack in watch mode
- `test` Bundle all *.test.ts and run it through a headless browser

## Developer Information

- [Developer guide](https://github.com/rangle/batarangle/wiki)
- [Contributing guidelines](CONTRIBUTING.md)
- [Architecture of this extension](./docs/ARCHITECTURE.md)

## Current Limitations

As of the latest release, if you would like to use this extension to debug your application, you will need to bind the default `AppViewListener` to `DebugElementViewListener` during the bootstrapping of your app. It should look something like this:

```
bootstrap(App, [
  bind(AppViewListener).toClass(DebugElementViewListener),
  ...
  <other dependencies>
  ...
]);
```
You can also take a look at [how it's done in the example app](./example-apps/todo-mvc-example/source/app.ts#L10). This issue will be resolved at official release.

## Future Plans

We are working hard towards [the official release](https://github.com/rangle/batarangle/releases). But at the mean time, you can take a look at our [milestones](https://github.com/rangle/batarangle/milestones) to see what new features are in place.

## License
[MIT](LICENSE)
