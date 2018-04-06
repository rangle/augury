import * as A from '../actions/misc-actions'

export default function * ConfirmArrivalCity ({ msg, dispatch, getFragment, getNode, getArgs, emptyMsg}) {

  const hasIntent = (intent) => msg.intents.find(i => i.intent == intent)

  if (hasIntent('backtrack')) {
    const uacFragment = getFragment('undoArrivalCity')()
    yield dispatch(A.updateState(uacFragment.patch))
    yield dispatch(A.say(uacFragment.statement))
    yield dispatch(A.say(uacFragment.question))
    return { nextNode: uacFragment.nextNode }
  }

  else if (hasIntent('confirm')) {
    yield dispatch(A.say(`ok great.`))
    const cdcFragment = getFragment('checkDepartureCity')()
    if(cdcFragment.question) {
      yield dispatch(A.say(cdcFragment.question))
      return { nextNode: cdcFragment.nextNode }
    } else {
      return yield getNode('Start')(getArgs({ initiate: true }))
    }
  }

  else {
    const aacFragment = getFragment('askArrivalCity')()
    yield dispatch(A.say(`sorry, i dont understand..`))
    yield dispatch(A.say(aacFragment.question))
    return { nextNode: aacFragment.nextNode }
  }

}
