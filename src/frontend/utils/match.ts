import {Node} from '../../tree';
import {Route} from '../../backend/utils/parse-router';

export const matchString = (query: string, value: string): boolean => {
  const llhs = (query || '').toLocaleLowerCase();
  const lrhs = (value || '').toLocaleLowerCase();

  return lrhs.indexOf(llhs) >= 0;
};

export const matchValue = <T>(query: string, value: T): boolean => {
  if (value == null) {
    return false;
  }
  return matchString(query, value.toString());
};

export const matchNode = (node: Node, query: string): boolean => {
  if (matchString(query, node.name)) {
    return true;
  }

  if (node.description) {
    const matches = node.description
      .map(d => matchValue(query, d.value)).filter(v => v === true);

    return matches.length > 0;
  }

  return false;
};

export const matchRoute = (route: Route, query: string): boolean => {
  throw new Error('Not implemented');
};
