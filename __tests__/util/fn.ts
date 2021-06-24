export const getRandom = (min = 0, max: number = min): number => {
  if (min > max) {
    [min, max] = [max, min];
  }
  const length = max - min;
  return (min + Math.random() * length) >>> 0;
};
