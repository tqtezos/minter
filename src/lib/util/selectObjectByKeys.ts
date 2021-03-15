export const $any = Symbol('any');
export const $some = Symbol('some');

export default function selectObjectByKeys(
  object: any,
  ks: Record<string, any>
): Record<string, any> | null {
  if (object === null || object === undefined) {
    return null;
  }

  const isMatch = Object.keys(ks).every(k => {
    if (!object.hasOwnProperty(k)) {
      return false;
    }
    if (ks[k] === $any) {
      return true;
    }
    if (ks[k] === $some && object[k] !== null && object[k] !== undefined) {
      return true;
    }
    if (ks[k] === object[k]) {
      return true;
    }
    return false;
  });

  if (isMatch) {
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
