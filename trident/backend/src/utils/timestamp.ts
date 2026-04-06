export const timestamp = () => {
  return new Date().toISOString();
};

export const getUnixTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
