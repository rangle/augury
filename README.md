# Angular 2.0 Batarangle

Batarangle is a Google Chrome Dev Tools extension for debugging Angular 2 applications. Treat this as a "developer preview". We expect to release the first version soon after Angular 2 beta is out. Until then, please follow instructions below to build the tool locally and install it from source. It's actually quite easy.

## Join Our Slack Team

If you want to contribute or need help getting started, join us on Slack by filling in [this form](https://rangle.typeform.com/to/SQsWag).

## Development Environment

To develop this extension the following environment is used

* Node v0.12.7
* NPM 2.11.3
* TypeScript 1.6.2
* tsd 0.6.5

In addition, example applications all run with a globablly installed version of jspm 0.16.12.
The build process for the extension will transition to jspm as well in future iterations.

## Trying out the extension

1. Clone this repository: `git clone git://github.com/rangle/batarangle`.
2. Run `npm install`.
3. Run `npm build` (errors related to typing files conflicts can be ignore for now).
4. Navigate to chrome://extensions and enable Developer Mode.
5. Choose "Load unpacked extension".
6. In the dialog, open the directory you just cloned.

To try out with an example application, refer to instructions in [README](./example-apps/todo-mvc-example/README.md)

## Developer Information

More information about the architecture of this extension can be found in the docs folder of this repo.
