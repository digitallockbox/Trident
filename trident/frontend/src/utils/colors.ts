export const colors = {
  slate: '#64748b',
  cyan: '#06b6d4',
  purple: '#a855f7',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

export const getColor = (name: keyof typeof colors): string => {
  return colors[name];
};
