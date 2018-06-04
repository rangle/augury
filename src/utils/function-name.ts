/// Extract the name of a function (the `name' property does not appear to be set
/// in some cases). A variant of this appeared in older Augury code and it appears
/// to cover the cases where name is not available as a property.
export const functionName = (fn: Function): string => {
  const extract = (value: string) => value.match(/^function ([^\(]*)\(/);

  let name: string = (<any>fn).name;
  if (!name || name.length === 0) {
    const match = extract(fn.toString());
    if (match != null && match.length > 1) {
      name = match[1];
    }
  }

  if (typeof name !== 'string' || name === '') {
    name = 'anonymous';
  }

  name = name.replace(/[^\w]/gi, '');

  if (!isNaN(parseInt(name[0], 10))) {
    name = '__num_' + name[0];
  }

  return name;
};
