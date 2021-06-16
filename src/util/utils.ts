export const isFunction = (obj: any) => {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};
