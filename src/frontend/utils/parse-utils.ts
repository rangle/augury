import {
  MutableTree,
  Node,
  Path,
  deserializePath,
  serializePath,
} from '../../tree';

import {Dependency} from '../../backend/utils/description';

export class ParseUtils {
  getParentNodeIds(nodeId: string) {
    const path = deserializePath(nodeId);

    const result = new Array<string>();

    for (let i = 1; i < path.length; ++i) {
      result.push(serializePath(path.slice(0, i)));
    }

    return result;
  }

  getNodeDependency(node: Node, dependencyName: string) {
    return node.dependencies.reduce((prev, curr, idx, p) =>
      prev ? prev : p[idx].type === dependencyName ? p[idx] : null, null);
  }

  checkNodeProvidesDependency(node: Node, dependency: Dependency) {
    return node.providers.reduce((prev, curr, idx, p) =>
      prev ? prev : p[idx].key === dependency.type, false);
  }

  getDependencyProvider(tree: MutableTree, nodeId: string, dependency: Dependency) {
    if (tree == null) {
      return null;
    }

    const node = tree.lookup(nodeId);
    if (this.checkNodeProvidesDependency(node, dependency)
      && dependency.decorators.indexOf('@SkipSelf') < 0) {
      return node;
    }

    const nodeIds = this.getParentNodeIds(nodeId);

    for (const id of nodeIds) {
      const matchingNode = tree.lookup(id);
      if (this.checkNodeProvidesDependency(matchingNode, dependency)) {
        return matchingNode;
      }
    }

    return null;
  }

  getParentHierarchy(tree: MutableTree, node: Node, filter?: (n: Node) => boolean): Array<Node> {
    if (tree == null) {
      return [];
    }

    const nodeIds = this.getParentNodeIds(node.id);

    const hierarchy = nodeIds.reduce(
      (array, id) => {
        const matchingNode = tree.lookup(id);
        if (matchingNode) {
          array.push(matchingNode);
        }
        return array;
      },
      []);

    if (typeof filter === 'function') {
      return hierarchy.filter(n => filter(n));
    }

    return hierarchy;
  }

  flatten(list: Array<Node>): Array<Node> {
    return list.reduce((a, b) =>
      a.concat(Array.isArray(b.children) ?
        [this.copyParent(b), ...this.flatten(b.children)] : b),
      []);
  }

  copyParent(p: Object) {
    return Object.assign({}, p, { children: undefined });
  }
}
