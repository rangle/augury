import { _o } from './utils'

const initialState = [

]

export default function(state = initialState, action) {
  switch(action.type) {
    case 'NEW_LIST':
      return action.flights || []
    default:
      return state
  }
}
