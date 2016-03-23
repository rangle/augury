export class ParseUtils {
  getDependencyLink
    (flattenedTree: any, nodeId: string, dependency: string) {
    let searchId, searchedNodes, node;

    for (let i: number = nodeId.length - 2; i > -1; i = i - 2) {
       searchId =  nodeId.substr(0, i);
       searchedNodes = flattenedTree.filter((n) => n.id === searchId);

       if (searchedNodes.length > 0 &&
           searchedNodes[0].injectors.indexOf(dependency) > -1) {
         node = searchedNodes[0];
         break;
       }
    }
    return node;
  }

  getParentHierarchy(flattenedTree: any, node: any) {
    const nodeId: string = node.id;
    const hierarchy = [];

    for (let i: number = 2; i <= nodeId.length; i = i + 2) {
      const searchId = nodeId.substr(0, i - 1);
      const searchNode = flattenedTree.filter((n) => n.id === searchId);
      if (searchNode.length > 0) {
        hierarchy.push(searchNode[0]);
      }
    }
    return hierarchy;
  }

  flatten(list: Array<any>) {
    return list.reduce((a, b) => {
      return a.concat(Array.isArray(b.children) ?
        [this.copyParent(b), ...this.flatten(b.children)] : b);
    }, []);
  }

  copyParent(p: Object) {
    return Object.assign({}, p, { children: undefined });
  }

}
