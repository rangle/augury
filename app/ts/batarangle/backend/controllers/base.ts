/**
 * Base Controller
 *
 * A controller runs within the application context and mediates between the
 * framework adapter and the developer tools.
 *
 * First, it is charged with setting up the backend. It does so by detecting
 * and instantiating the appropriate adapter given the version of the framework
 * on the page. Once done, it listens to events from the adapter and the
 * developer tools (front end) and mediates communication between the two.
 *
 * Communications occur over the channels.
 */

import { BaseAdapter } from '../adapters/base';

function notYetImplemented() {
  throw new Error('Not yet implemented.');
}


export class BaseController {

  static detectFramework(): BaseAdapter {
    return;
  }
}