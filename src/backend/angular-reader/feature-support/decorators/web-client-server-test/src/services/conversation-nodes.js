import { Start } from '../conversation-graph/Start'
import { ProvideDepartureCity } from '../conversation-graph/ProvideDepartureCity'
import { ProvideArrivalCity } from '../conversation-graph/ProvideArrivalCity'
import { ProvideBothCities } from '../conversation-graph/ProvideBothCities'
import { ChangeDepartureCity } from '../conversation-graph/ChangeDepartureCity'
import { ChangeArrivalCity } from '../conversation-graph/ChangeArrivalCity'
import { ConfirmArrivalCity } from '../conversation-graph/ConfirmArrivalCity'

import co from 'co'

function _o(object, ...extensions){
  return Object.assign({}, object, ...extensions.filter(e => !!e))
}

export function stop (m, s, n) {
  //if (intent.)
  return {
    text: `we're done. talk to the hand.`,
    nextNode: 'stop'
  }
}

export function graph({ start, nodes }){

  const getNode = (name) => {
    const node = nodes.find(n => n.name == name)
    if (!node) console.log(`node "${name}" not found`)
    return node
  }

  const parsedMsgType = {
    entities: [],
    intents: [],
    input: {
      text: undefined
    }
  }

  return (parsedMsg, conversationState) => {

    window.s = conversationState

    const handlerNode = conversationState.nextNode || start || 'Start'
    const node = getNode(handlerNode)
    parsedMsg = _o(parsedMsgType, parsedMsg)

    const supportingNodes = []
    const getAndRecordNode = (name) => {
      supportingNodes.push(name)
      return getNode(name)
    }

    const response = node(parsedMsg, conversationState, getAndRecordNode)

    const nextNode = response.nextNode
    const su = response.stateUpdate || {}
    const backtrack = response.backtrack || {}
    return _o(response, {
      stateUpdate: _o(su, {
        nextNode,
        history: conversationState.history.concat([ {
          node: handlerNode,
          supportingNodes,
          backtrack,
        }]),
        backtrack: undefined
      })
    })

  }
}

export const respond = graph({
  nodes: [
    Start,
    ProvideArrivalCity,
    ProvideDepartureCity,
    ProvideBothCities,
    ChangeArrivalCity,
    ChangeDepartureCity,
    ConfirmArrivalCity,
    stop, // for development
  ]
});
