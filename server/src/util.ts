export const anyValue = Symbol('any');

export function selectObjectByKeys(
  object: any,
  ks: Record<string, any>
): Record<string, any> | null {
  if (object === null) {
    return null;
  }

  if (
    Object.keys(ks).every(
      k =>
        object.hasOwnProperty(k) &&
        (ks[k] === anyValue ? true : ks[k] === object[k])
    )
  ) {
    return object;
  }

  const keys = Object.keys(object);
  for (let key of keys) {
    if (typeof object[key] == 'object') {
      const result = selectObjectByKeys(object[key], ks);
      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}
