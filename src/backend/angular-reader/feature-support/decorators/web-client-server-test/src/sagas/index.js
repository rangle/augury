import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects'
import { updateArrivalCity } from '../actions/flightsActions'
import { getFlights } from '../services/FlightsService'


function* mySaga() {

  const flights = yield getFlights()
  yield put({ type: 'NEW_LIST', flights })

  yield takeLatest([
    'SET_ARRIVAL_CITY',
    'SET_DEPARTURE_CITY',
    'RESET_ARRIVAL_CITY',
    'RESET_DEPARTURE_CITY',
    'RESET_CITIES',
  ], function* (action) {

    const params = yield select( state => ({
      arrival_city: state.conversation.context.arrival_city,
      departure_city: state.conversation.context.departure_city
    }))
    const flights = yield getFlights(params)
    yield put({ type: 'NEW_LIST', flights })

  })

}

export default mySaga
