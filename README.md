# Angular 2.0 Batarangle

THIS IS A WORK IN PROGRESS

## Development Environment

To develop this extension the following environment is used

* Node v0.12.7
* npm 2.11.3
* TypeScript 1.6.2
* tsd 0.6.5

In addition, example applications all run with a globablly installed version of jspm 0.16.12.
The build process for the extension will transition to jspm as well in future iterations.

## Trying out the extension

1. Clone this repository: `git clone git://github.com/rangle/batarangle`.
2. Run `npm install`.
3. Run `gulp build` (errors related to typing files conflicts can be ignore for now).
4. Navigate to chrome://extensions and enable Developer Mode.
5. Choose "Load unpacked extension".
6. In the dialog, open the directory you just cloned.

To try out with an example application, refer to instructions in [README](./example-apps/todo-mvc-example/README.md)

## Developer Information

More information about the architecture of this extension can be found in the docs folder of this repo.
