import rp from 'request-promise'

export function updateArrivalCity(arrivalCity){
  return dispatch => {
    rp('localhost:3004/flights')
      .then(flights => dispatch({
        type: 'NEW_LIST',
        flights: [
          {
            arrival_city: 'test arrival',
            departure_city: 'test departure'
          }, {
            arrival_city: 'test arrival 2',
            departure_city: 'test departure 2'
          }
        ]
      }))

  }
}
