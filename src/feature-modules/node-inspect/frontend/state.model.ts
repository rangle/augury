export const NAMESPACE = 'node-inspect';
const _getState = (store: any): NodeInspectState => store[NAMESPACE];

export interface NodeInspectState {
  examples: Array<string>;
}

export const INITIAL_STATE: NodeInspectState = {
  examples: []
};

export class NodeInspectSelectors {
  static examples
    = (store) => {
      debugger
      _getState(store).examples
    }
}

export class NodeInspectUpdaters {

  static addExample = () =>
    (state: NodeInspectState): NodeInspectState => {
      return merge(state, {
        examples: state.examples.concat([ 'example' ]) })
    }

}

const merge = (...objs) => Object.assign({}, ...objs);
