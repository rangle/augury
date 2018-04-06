import * as A from '../actions/misc-actions'

export default function * ProvideDepartureCity (
  { msg, params, S: { getState, dispatch, getFragment, pushWaiting, popWaiting, getHistoryFrame, getNode, getArgs } }
) {

  const hasIntent = (intent) => msg.intents.find(i => i.intent == intent)

  // --- backtrack hook ---
  // this should be a parent class method with hook
  if (hasIntent('backtrack')) {

    const historyFrame = getHistoryFrame()

    // do state update actions
    for (const updateFragmentName of historyFrame.backtrack.updates) {
      const uFragment = getFragment(updateFragmentName)()
      yield dispatch(A.updateState(uFragment.patch))
      yield dispatch(A.updateState(uFragment.statement))
    }

    // add frames to waiting stack
    yield pushWaiting(historyFrame.backtrack.enqueue)

    // grab next fragment ("thought") from queue/stack
    // this should be a question (or statement?) thought
    //    in any case, a thought (fragment) that expects a user response
    const nextWaiting = yield popWaiting()

    if (nextWaiting) {

      const nwFragment = getFragment(nextWaiting)()

      // for now, only question thoughts are expected
      yield dispatch(A.say(nwFragment.question))
      return { nextNode: nwFragment.nextNode }

    } else {

      return yield getNode('Start')(getArgs({ initiate: true }))

    }

  }

  const grabFirstEntity = (entity) => (
      msg.entities.find(e => e.entity == entity) || {}
    ).value

  const departureCity = grabFirstEntity('City')
  const arrivalCity = getState().arrivalCity

  const rdcFragment = getFragment('receiveDepartureCity')({ departureCity })

  if (departureCity) {

    yield dispatch(A.updateState(rdcFragment.patch))
    yield dispatch(A.say(rdcFragment.statement))

    const backtrack = [ 'undoDepartureCity' ]

    const cacFragment = getFragment('checkArrivalCity')()

    if (cacFragment.question) {
      yield dispatch(A.say(cacFragment.question))
      return { backtrack, nextNode: cacFragment.nextNode }
    } else {

      let grabFragment;
      while (grabFragment = getFragment(popWaiting())) {
        const wFragment = yield grabFragment()
        if (wFragment.question) {
          yield dispatch(A.updateState(wFragment.question));
          return { nextNode: wFragment.nextNode }
        }
      }

      yield dispatch(A.say(`k, i guess we're done`))
      return { backtrack, nextNode: 'stop' }

    }

  } else {

    const adcFragment = getFragment('askDepartureCity')()

    yield dispatch(A.say(rdcFragment.statement))
    yield dispatch(A.say(adcFragment.question))

    return { nextNode: adcFragment.nextNode }

  }

}
