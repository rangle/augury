import {
  MutableTree,
  Node,
  Path,
  deserializePath,
  serializePath,
} from '../../tree';

export class ParseUtils {
  getParentNodeIds(nodeId: string) {
    const path = deserializePath(nodeId);

    const result = new Array<string>();

    for (let i = 1; i < path.length; ++i) {
      result.push(serializePath(path.slice(0, i)));
    }

    return result;
  }

  getDependencyLink (tree: MutableTree, nodeId: string, dependency: string) {
    const nodeIds = this.getParentNodeIds(nodeId);

    for (const id of nodeIds) {
      const matchingNode = tree.search(id);
      if (matchingNode &&
          matchingNode.injectors.indexOf(dependency) >= 0) {
        return matchingNode;
      }
    }

    return null;
  }

  getParentHierarchy(tree: MutableTree, node: Node): Array<Node> {
    const nodeIds = this.getParentNodeIds(node.id);

    const hierarchy = nodeIds.reduce(
      (array, id) => {
        const matchingNode = tree.search(id);
        if (matchingNode) {
          array.push(matchingNode);
        }
        return array;
      },
      []);

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
