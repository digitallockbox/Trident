export const calculateScore = (metrics: Record<string, number>): number => {
  const values = Object.values(metrics);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.min(100, Math.max(0, average));
};

export const calculateWeight = (values: number[], weights: number[]): number => {
  return values.reduce((sum, val, idx) => sum + val * weights[idx], 0);
};
