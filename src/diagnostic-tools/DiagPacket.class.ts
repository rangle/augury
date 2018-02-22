import stringify from 'fast-safe-stringify';

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
}

export class DiagPacketConstructor extends DiagPacket {

  header: string;
  pre: {
    msgs: Array<{ color: string; txt: string }>,
    snapshots: {}, // Map < K: string: name of inspected object, string: stringified object >
  };
  post: {
    msgs: Array<{ color: string; txt: string }>,
    snapshots: {},
  };

  constructor() {
    super();
    this.header = '';
    this.pre =  { msgs: [], snapshots: {} };
    this.post = { msgs: [], snapshots: {} };
  }

  setHeader = (txt: string) => {
    this.header = txt;
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
    post: this.post
  })

}
