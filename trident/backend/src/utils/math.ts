export const mathUtils = {
  average: (nums: number[]): number => {
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  },

  sum: (nums: number[]): number => {
    return nums.reduce((a, b) => a + b, 0);
  },

  max: (nums: number[]): number => {
    return Math.max(...nums);
  },

  min: (nums: number[]): number => {
    return Math.min(...nums);
  },

  variance: (nums: number[]): number => {
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return nums.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0) / nums.length;
  },

  standardDeviation: (nums: number[]): number => {
    return Math.sqrt(mathUtils.variance(nums));
  },
};
