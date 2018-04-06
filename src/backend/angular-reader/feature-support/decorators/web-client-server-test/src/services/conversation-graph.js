import co from 'co'
import clone from 'clone'

const initialState = {
  history: [],
  waiting: [],
  nextNode: undefined
}

export function conversationStateReducer(state = initialState, action) {
  switch(action.type) {

    case '__CONV_HANDLED_MSG__':
      return { ...state, ...{
        nextNode: action.nextNode,
        history: state.history.concat([
          {
            node: action.nodeName,
            supportingNodes: action.supportingNodes,
            backtrack: action.backtrack
          }
        ])
      }, }

    case '__ADD_WAITING_FIRST__':
      return { ...state, ...{
        waiting: state.waiting.concat(action.fragments)
      } }

    case '__REMOVE_WAITING_FIRST__':
      return { ...state, ...{
        waiting: state.waiting.slice(0, -1)
      } }

    default:
      return state;

  }
}

function msgHandledAction({ nodeName, supportingNodes, nextNode, backtrack }){
  return {
    type: '__CONV_HANDLED_MSG__',
    ...{ nodeName, supportingNodes, nextNode, backtrack }
  }
}

function addToWaitingAction(fragments, position = 'first'){
  return {
    type: '__ADD_WAITING_FIRST__',
    fragments
  }
}

function removeFromWaitingAction(fragments, position = 'first'){
  return {
    type: '__REMOVE_WAITING_FIRST__'
  }
}

export function conversationGraph({ start, nodes, fragments }){

  const parsedMsgBaseType = {
    entities: [],
    intents: [],
    input: {
      text: undefined
    }
  }

  const backtrackInstructionsBaseType = {
    updates: [], // array of fragment names
    enqueue: [], // array of fragment names
  }

  const applyBaseType = (object, baseType) => Object.assign({}, baseType, object)

  // this is the conversation graph object creator
  return ({ dispatch, getState }) => {

    const convState = () => getState()._conv_

    return {

      handleMsg(parsedMsg) {

        parsedMsg = applyBaseType(parsedMsg, parsedMsgBaseType)

        const getPromiseNode = (name) => {
          const node = nodes.find(n => n.name == name)
          if (!node) console.log(`node "${name}" not found`)
          return co.wrap(node)
        }

        const getWrappedFragment = (name) => {
          const fragment = fragments.find(f => f.name == name)
          if (!fragment) console.log(`fragment "${name}" not found`)
          return params => fragment({
            params,
            getState,
            getFragment: getWrappedFragment
          })
        }

        const getHistoryFrame = (index = 1) => {
          const history = getState()._conv_.history
          return clone(history[history.length - index])
        }

        const popWaiting = (position = 'first') => {
          if (!getState()._conv_.waiting) return null
          const fragment = getState()._conv_.waiting.slice(0, -1)
          return Promise.resolve(dispatch(
            removeFromWaitingAction()
          )).then(() => fragment)
        }

        const pushWaiting = (fragments, position = 'first') => {
          fragments = Array.isArray(fragments) ? fragments : [fragments]
          return Promise.resolve(dispatch(
            addToWaitingAction(fragments, position)
          ))
        }

        const supportingNodes = []
        const getAndRecordNode = (name) => {
          supportingNodes.push(name)
          return getPromiseNode(name)
        }

        const supportingFragments = []
        const getAndRecordFragment = (name) => {
          supportingFragments.push(name)
          return getWrappedFragment(name)
        }

        const nodeName = convState().nextNode || start || 'Start'
        const node = getPromiseNode(nodeName)

        const getArgs = ({ ...params } = {}) => ({
          params,
          msg: parsedMsg,
          flags: [],
          getState,
          dispatch,
          emptyMsg: () => applyBaseType({}, parsedMsgBaseType),
          getNode: getAndRecordNode,
          getFragment: getAndRecordFragment,
          getHistoryFrame,
          pushWaiting,
          popWaiting,
        })

        return node({ getArgs, ...getArgs() })
          .then(({ nextNode, backtrack }) => {

            dispatch(
              msgHandledAction({
                nodeName,
                supportingNodes,
                nextNode,
                backtrack: applyBaseType(backtrack, backtrackInstructionsBaseType)
              })
            )

          })

      }

    }

  }

}


// helpers -----

function _o(object, ...extensions){
  return Object.assign({}, object, ...extensions)
}
