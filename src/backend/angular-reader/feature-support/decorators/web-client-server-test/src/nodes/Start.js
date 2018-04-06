import * as A from '../actions/misc-actions'

export default function * Start ({ msg, params, getNode, getFragment, getState, dispatch, getArgs, popWaiting }) {

  // utils
  const grabFirstEntity = (entity) => (
      msg.entities.find(e => e.entity == entity) || {}
    ).value

  const s = getState().conversation

  if (params.initiate){
    let grabFragment;
    while (grabFragment = getFragment(popWaiting())) {
      const wFragment = yield grabFragment()
      if (wFragment.question) {
        yield dispatch(A.updateState(wFragment.question));
        return { nextNode: wFragment.nextNode }
      }
    }
  }

  if (!msg.input.text && !s.saidHi) { // init message is blank
    yield dispatch(A.say('hello! can i help you?'))
    yield dispatch(A.updateState({ saidHi: true }))
    return { nextNode: 'Start' }
  }

  if (msg.intents.find(i => i.intent == 'info-location-arrival')) {
    const date = grabFirstEntity('sys-date')
    if (date) {
      const sdFragment = getFragment('setDate')({ date })
      yield dispatch(A.updateState(sdFragment.patch))
      yield dispatch(A.say(sdFragment.statement))
      const pacNodeRet = yield getNode('ProvideArrivalCity')(getArgs())

      // backtrack type should be filled by provided func
      // also funcs like merge backtracks

      const mergeBacktrack = (bt1 = {}, bt2 = {}) => {
        const mergeArr = (prop) => ( bt1[prop] || [] ).concat( bt1[prop] || [] )
        return {
          updates: mergeArr('updates'),
          enqueue: mergeArr('enqueue')
        }
      }

      return {
        ...pacNodeRet,
        backtrack: mergeBacktrack(
          pacNodeRet.backtrack,
          sdFragment.backtrack
        )
      }
    } else {
      return getNode('ProvideArrivalCity')(getArgs())
    }

  }

  if (msg.intents.find(i => i.intent == 'info-location-both')) {}
    // return getNode('ProvideArrivalCity')(m, s, n)

  if (msg.intents.find(i => i.intent == 'info-location-departure')) {
    // return getNode('ProvideDepartureCity')(m, s, n)
  }

  yield dispatch(A.say(`umm, sorry what?`))

  return { nextNode: 'Start' }

}
