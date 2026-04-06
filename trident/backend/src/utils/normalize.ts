export const normalize = (value: number, min: number, max: number): number => {
  return (value - min) / (max - min);
};

export const denormalize = (value: number, min: number, max: number): number => {
  return value * (max - min) + min;
};
