import * as test from 'tape';
import { AdapterEventType } from '../adapters/event_types';


// Ensure our silly workarounds actually work.
test('adapters/event types: available event types', t => {
  t.plan(4);

  t.equal(AdapterEventType.ROOT, 'root',  'has root event type');
  t.equal(AdapterEventType.ADD, 'add',  'has add event type');
  t.equal(AdapterEventType.CHANGE, 'change',  'has change event type');
  t.equal(AdapterEventType.REMOVE, 'remove',  'has remove event type');

});
