import {Node} from './node';

export type Path = Array<string | number>;

export const serializePath = (path: Path): string => {
  return path.join(' ');
};

export const deserializePath = (path: string): Path => {
  return path.split(/ /).map(piece => {
    const v = parseInt(piece, 10);
    if (isNaN(v)) {
      return piece;
    }
    return v;
  });
};