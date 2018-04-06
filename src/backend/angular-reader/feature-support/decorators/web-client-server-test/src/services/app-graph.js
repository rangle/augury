
import { conversationGraph } from './conversation-graph'

import { graph } from './conversation-graph'
import * as F from './FlightsService'

import * as A from '../actions/misc-actions'

import * as NODES from '../nodes/index'

import * as FRAGMENTS from './fragments'

// node (import)
export function * stop ({ msg, getState, getFragment, dispatch, pushWaiting, getHistoryFrame }) {

  // this should be a parent class method with hook
  if (msg.intents.find(i => i.intent == 'backtrack')) {

    let questionFragment; // we will use the last fragment with question

    for (const fragment of getHistoryFrame().backtrack) {
      if (fragment.patch)
        yield dispatch(A.updateState(fragment.patch))
      if (fragment.statement)
        yield dispatch(A.say(fragment.statement))
      if (fragment.question)
        questionFragment = fragment
    }

    if (questionFragment) {
      yield dispatch(A.say(questionFragment.question))
      return { nextNode: questionFragment.nextNode }
    }

  }

  yield dispatch(A.updateFlightsList())

  console.log('2')

  yield dispatch(A.say(`we're done. talk to the hand.`))

  return {
    nextNode: 'stop'
  }
}

export const createWFConversationGraph = conversationGraph({
//  start: 'stop',
  nodes: [ stop, ...Object.values(NODES) ],
  fragments: [ ...Object.values(FRAGMENTS) ],
});
