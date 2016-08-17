export class ParseUtils {
  getNodesMap(tree) {
    return this
      .flatten(tree)
      .reduce((previousValue, node) => {
        previousValue[node.id] = node;
        return previousValue;
      },
      {});
  }

  getChangedNodes(previousTree, newTree) {
    const flattenedOldData = this.getNodesMap(previousTree);

    return this
      .flatten(newTree)
      .reduce((x, n) => {
        if (!flattenedOldData[n.id]) {
          x.push(n.id);
        } else if (flattenedOldData[n.id] !== n) {
          x.push(n.id);
        }
        return x;
      },
      []);
  }

  getParentNodeIds(nodeId: string) {
    const nodeIds = nodeId.split('.');
    let initalValue = {
      concatedIds : '',
      allIds : []
    };

    const reduced = nodeIds.reduce((previousVal, currentVal) => {
      const concatenated =
      previousVal.concatedIds.length === 0 ?
        previousVal.concatedIds + currentVal :
        previousVal.concatedIds + '.' + currentVal;

      previousVal.concatedIds = concatenated;
      previousVal.allIds.push(concatenated);

      return previousVal;
    }, initalValue);
    reduced.allIds.pop();
    return reduced.allIds;
  }

  getDependencyLink (flattenedTree: any, nodeId: string, dependency: string) {
    let node;
    const nodeIds = this.getParentNodeIds(nodeId);

    nodeIds.forEach((id) => {
      const searchNodes = flattenedTree.filter((n) => n.id === id);
      if (!node && searchNodes.length > 0 &&
          searchNodes[0].injectors.indexOf(dependency) > -1) {
        node = searchNodes[0];
      }
    });
    return node;
  }

  getParentHierarchy(flattenedTree: any, node: any) {
    const nodeIds = this.getParentNodeIds(node.id);

    const hierarchy = nodeIds.reduce((data, id) => {
      const searchNodes = flattenedTree.filter((n) => n.id === id);
      if (searchNodes.length > 0) {
        data.push(searchNodes[0]);
      }
      return data;
    }, []);

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
