import * as A from '../actions/misc-actions'

export default function * ConfirmDepartureCity ({ msg, dispatch, getFragment, getNode, getArgs, emptyMsg}) {

  const hasIntent = (intent) => msg.intents.find(i => i.intent == intent)

  if (hasIntent('backtrack')) {
    const udcFragment = getFragment('undoDepartureCity')()
    yield dispatch(A.updateState(udcFragment.patch))
    yield dispatch(A.say(udcFragment.statement))
    yield dispatch(A.say(udcFragment.question))
    return { nextNode: udcFragment.nextNode }
  }

  else if (hasIntent('confirm')) {
    yield dispatch(A.say(`ok great.`))
    const cacFragment = getFragment('checkArrivalCity')()
    if(cacFragment.question) {
      yield dispatch(A.say(cacFragment.question))
      return { nextNode: cacFragment.nextNode }
    } else {
      return yield getNode('Start')(getArgs({ initiate: true }))
    }
  }

  else {
    const adcFragment = getFragment('askDepartureCity')()
    yield dispatch(A.say(`sorry, i dont understand..`))
    yield dispatch(A.say(adcFragment.question))
    return { nextNode: adcFragment.nextNode }
  }

}
