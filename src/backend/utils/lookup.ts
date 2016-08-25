import {MutableTree} from '../../tree';

export const defineLookupOperation = (tree: () => MutableTree) => {
  // NOTE(cbond): This is required to look up nodes based on a path from the
  // frontend. The only place it is used right now is in the inspectElement
  // operation. It would be nice if there were a cleaner way to do this.
  // This allows us to inspect a node by ID or view source by ID.
  if (typeof (<{pathLookupNode?}>window).pathLookupNode !== 'undefined') {
    throw new Error('A function called pathLookupNode would be overwritten');
  }

  Object.assign(window, {
    pathLookupNode: (id: string) => {
      const currentTree = tree();
      if (currentTree == null) {
        throw new Error('No tree exists');
      }

      const node = currentTree.search(id);
      if (node == null) {
        console.error(`Cannot find element associated with node ${id}`);
        return null;
      }
      return node.nativeElement();
    }
  });
};
