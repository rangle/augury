// FIXME(cbond): This needs to trace a path back to the parent in order to have
// optimal behaviour of the expansion / selection state. Even if a node changes
// we can still select or highlight the right one by tracing the path.  TODO
export const getUniqueIdentifier = () => Math.random().toString(16).slice(2);
