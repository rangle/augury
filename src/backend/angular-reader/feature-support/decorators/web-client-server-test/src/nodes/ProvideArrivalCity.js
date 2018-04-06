import * as A from '../actions/misc-actions'

export default function * ProvideArrivalCity ({ msg, getState, dispatch, getFragment }) {

  const grabFirstEntity = (entity) => (
      msg.entities.find(e => e.entity == entity) || {}
    ).value

  const arrivalCity = grabFirstEntity('City')
  const departureCity = getState().departureCity

  const racFragment = getFragment('receiveArrivalCity')({ arrivalCity })

  if (arrivalCity) {

    yield dispatch(A.updateState(racFragment.patch))
    yield dispatch(A.say(racFragment.statement))

    const backtrack = {
      updates: [ 'undoArrivalCity' ],
      enqueue: [ 'askArrivalCity' ]
    }

    const adcFragment = getFragment('askDepartureCity')()

    if (adcFragment.question) {
      yield dispatch(A.say(adcFragment.question))
      return { backtrack, nextNode: adcFragment.nextNode }
    } else {
      yield dispatch(A.say(`i guess we're done!`))
      return { backtrack, nextNode: 'stop'}
    }

  } else {

    const aacFragment = getFragment('askArrivalCity')()

    yield dispatch(A.say(racFragment.statement))
    yield dispatch(A.say(aacFragment.question))
    return { nextNode: aacFragment.nextNode }

  }

}
