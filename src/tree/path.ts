import {Node} from './node';

export type Path = Array<string | number>;

export const serializePath = (path: Path): string => {
  return path.join(' ');
};

const numberOrString = (segment: string): string | number => {
  const v = parseInt(segment, 10);
  if (isNaN(v)) {
    return segment;
  }
  return v;
};

export const deserializePath = (path: string): Path => {
  return path.split(/ /).map(numberOrString);
};

export const deserializeChangePath = (path: string): Path => {
  return path.split(/\/| /).map(numberOrString);
};
