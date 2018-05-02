import {getRandomHash} from './hash';
import { Serialize, messageSource } from './message';

export const create = <T>(properties: T) =>
  Object.assign({
    messageSource,
    messageId: getRandomHash(),
    serialize: Serialize.None,
  },
  properties);
