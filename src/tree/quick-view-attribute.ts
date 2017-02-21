import {Property} from '../backend/utils/description';

/// quickViewAttribute will pick out some useful bit of information from a node element
/// and return an array of this information (structured as a Property object)
/// which will be displayed in the frontend on the component tree view.

export const quickViewAttribute = (node): Array<Property> => {
  switch (node.name) {
    case 'a':
      // links
      return node.description;
    default:
      return [];
  }
};
