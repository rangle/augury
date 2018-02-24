const stringifier = require('stringifier/build/stringifier'); // @todo: weird issues with this module. importing build file against webpack's recommendations
const stringify = stringifier({ indent: ' ' });

export class DiagPacket {
  header: string;
  pre: {
    msgs: Array<{ color: string; txt: string }>,
    snapshots: {}, // Map < K: string: name of inspected object, string: stringified object >
  };
  post: {
    msgs: Array<{ color: string; txt: string }>,
    snapshots: {},
  };
  diagError?: { section, error };
  exception: any;
}

export class DiagPacketConstructor extends DiagPacket {

  constructor() {
    super();
    this.header = '';
    this.pre =  { msgs: [], snapshots: {} };
    this.post = { msgs: [], snapshots: {} };
    this.diagError = undefined;
    this.exception = undefined;
  }

  setHeader = (txt: string) => {
    this.header = txt;
  }

  setException = e => {
    this.exception = e.toString();
  }

  setDiagError = ({ section, error }) => {
    error = error.toString();
    this.diagError = { section, error };
  }

  getSectionMethods = (section: 'pre'|'post') => ({
    msg: (m: {txt: string, color: string}) => {
      this[section].msgs.push(m);
    },
    inspect: (vals) => Object.keys(vals)
      .forEach(k => this[section].snapshots[k] = stringify(vals[k]))
  })

  finish = (): DiagPacket => ({
    header: this.header,
    pre: this.pre,
    post: this.post,
    exception: this.exception,
    diagError: this.diagError
  })

}
