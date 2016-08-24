const msgpack = require('msgpack-lite');

export const serializeBinary = <T>(object: T): Buffer =>
  msgpack.encode(object);

export const deserializeBinary = (buffer: Buffer) =>
  msgpack.decode(buffer);
