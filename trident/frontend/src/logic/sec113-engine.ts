export type Sec113Input = {
  seed: number;
};

export type Sec113Output = {
  score: number;
};

export function runSec113Engine(input: Sec113Input): Sec113Output {
  const normalizedSeed = Math.max(0, Math.floor(input.seed));
  return { score: normalizedSeed % 113 };
}
