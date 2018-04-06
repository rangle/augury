// general purpose development reducer actions
export function updateState(patch){
  return {
    type: 'UPDATE_STATE',
    patch
  }
}


// action
export function say(text) {
  return {
    type: 'ADD_MSG',
    msg: {
      text,
      username: 'bot'
    }
  }
}

// action
export function updateFlightsList(newList = []){
  return (dispatch, getState) => {
    return Promise.resolve().then(() => {
      console.log('1')
      dispatch({
        type: 'NEW_LIST',
        flights: newList
      })
    })
  }
}
