import rp from 'request-promise'
import qs from 'query-string'

const BASE_URL = 'http://localhost:3004/flights'

export function getFlights(params) {
  return rp(BASE_URL + '?' + qs.stringify(params))
    .then(data => JSON.parse(data))
}
