/// Extract the name of a function (the `name' property does not appear to be set
/// in some cases). A variant of this appeared in older Augury code and it appears
/// to cover the cases where name is not available as a property.
export const functionName = (fn: Function): string => {
  const extract = (value: string) => value.match(/^function ([^\(]*)\(/);

  let name: string = (<any>fn).name;
  if (name == null || name.length === 0) {
    const match = extract(fn.toString());
    if (match != null && match.length > 1) {
      return match[1];
    }
    return fn.toString();
  }
  return name;
};
